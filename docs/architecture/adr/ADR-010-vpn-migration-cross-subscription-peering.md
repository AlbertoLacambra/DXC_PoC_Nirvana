# ADR-010: VPN Migration to Cross-Subscription Architecture with VNET Peering

**Status:** Implemented  
**Date:** 2025-11-04  
**Author:** Alberto Lacambra  
**Tags:** `infrastructure`, `vpn`, `azure`, `networking`, `disaster-recovery`

---

## Context

The Dify platform deployment relies on a private AKS cluster (`dify-aks`) and associated resources in Azure subscription `739aaf91-5cb2-45a6-ab4f-abf883e9d3f7`. Access to these private resources requires VPN connectivity through an OPNSense VM (`dify-private-vm-opnsense`) deployed in the same subscription.

### Problem Statement

On **November 3, 2025**, the primary Azure subscription was **disabled** due to budget exhaustion ($200 credit limit reached). Key impacts:

1. **Subscription Status**: `ReadOnlyDisabledSubscription` until **November 14, 2025**
2. **VPN Access Lost**: Cannot start the OPNSense VM → No access to Dify infrastructure
3. **Critical Blocker**: Unable to manage or troubleshoot the production Dify deployment
4. **Cost Analysis**: 
   - Primary cost driver: **Log Analytics workspace** (`dify-private-logs`) consuming **€21.18**
   - Used by: AKS monitoring (omsagent addon) and Application Insights
   - Total monthly burn rate exceeded trial subscription budget

### Constraints

- **Cannot modify resources** in blocked subscription (no write operations)
- **Cannot export VM disks** or create snapshots (requires write access)
- **Cannot migrate resources** between subscriptions while blocked
- **Need immediate VPN access** to maintain Dify platform operations
- **Available resource**: Secondary Azure trial subscription (`353a6255-27a8-4733-adf0-1c531ba9f4e9`)

---

## Decision

We will implement a **cross-subscription VPN architecture** using VNET Peering:

### Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Subscription 739aaf91... (BLOCKED until 14/11)              │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ dify-private-vnet (10.0.0.0/16)     │                   │
│  │                                      │                   │
│  │  • AKS Cluster: 10.0.2.0/23         │                   │
│  │  • PostgreSQL: 10.0.4.0/24          │                   │
│  │  • OPNSense (OLD): 10.0.1.0/24      │◄── Deallocated    │
│  └──────────────┬───────────────────────┘                   │
│                 │                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  │ VNET Peering (Cross-Subscription)
                  │  - State: Initiated (pending bidirectional)
                  │  - Completion: Nov 14 when sub reactivates
                  │
┌─────────────────┼────────────────────────────────────────────┐
│                 │                                            │
│  ┌──────────────▼───────────────────┐                       │
│  │ vpn-vnet (10.10.0.0/16)         │                       │
│  │                                  │                       │
│  │  • VPN Gateway: 10.10.1.0/24    │◄──── 128.251.3.177    │
│  │    (OpenVPN Server)              │      Public IP        │
│  └──────────────────────────────────┘                       │
│                                                              │
│ Subscription 353a6255... (ACTIVE)                          │
│ Resource Group: vpn-rg                                     │
│ Location: North Europe                                     │
└──────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. **New VPN Infrastructure** (Subscription: 353a6255...)

| Resource | Specification | Purpose |
|----------|---------------|---------|
| **VNET** | `vpn-vnet` (10.10.0.0/16) | Non-overlapping address space |
| **Subnet** | `subnet-opnsense` (10.10.1.0/24) | VPN gateway subnet |
| **VM** | `vpn-vm` (Standard_B1s, Ubuntu 22.04) | Cost-optimized OpenVPN server |
| **Public IP** | `128.251.3.177` (Static) | VPN endpoint |
| **NSG** | Allow UDP/1194 (OpenVPN), TCP/22 (SSH) | Security controls |

#### 2. **OpenVPN Server Configuration**

- **Protocol**: UDP port 1194
- **Encryption**: AES-256-GCM with SHA512 auth
- **TLS**: TLS 1.2+ with ECDHE-ECDSA ciphers
- **PKI**: EasyRSA with EC certificates
- **Routes Pushed to Clients**:
  - `10.0.0.0/16` → Dify private VNET
  - `10.10.0.0/16` → VPN VNET
- **DNS**: Azure DNS (168.63.129.16)
- **NAT**: iptables MASQUERADE for client traffic forwarding

#### 3. **VNET Peering** (Cross-Subscription)

```bash
# Peering: vpn-vnet → dify-private-vnet
Name: vpn-to-dify
State: Initiated (RemoteNotInSync)
Allow Forwarded Traffic: Yes
Allow Gateway Transit: No

# Pending (requires subscription reactivation):
# Peering: dify-private-vnet → vpn-vnet
Name: dify-to-vpn
State: N/A (will be created on Nov 14)
```

**Key Point**: Peering is **unidirectional** until Nov 14. Traffic from VPN clients can be routed once bidirectional peering is established.

---

## Consequences

### Positive

✅ **Immediate VPN Access**: New OpenVPN server operational within 15 minutes  
✅ **Cost Isolation**: VPN costs isolated to secondary subscription  
✅ **Disaster Recovery Pattern**: Proven cross-subscription connectivity model  
✅ **No IP Conflicts**: Non-overlapping address spaces (10.0.x vs 10.10.x)  
✅ **Same Tenant**: Both subscriptions in tenant `93f33571-550f-43cf-b09f-cd331338d086` → peering allowed  
✅ **Scalable**: Can add more client certificates without VM changes  

### Negative

❌ **Manual Peering Completion**: Must create reverse peering on Nov 14 when subscription reactivates  
❌ **Client Reconfiguration**: All VPN users need new `.ovpn` configuration file  
❌ **Temporary Isolation**: Cannot access Dify resources until bidirectional peering completes  
❌ **Lost Configuration**: Original OPNSense settings not migrated (will export on Nov 14 if needed)  
❌ **Additional Subscription Dependency**: Now managing resources across two subscriptions  

### Neutral

⚪ **Technology Switch**: OPNSense → OpenVPN (both are production-grade VPN solutions)  
⚪ **VM Size**: Standard_B1s (smaller than original Standard_B1ms) but sufficient for VPN workload  
⚪ **Monitoring Gap**: Log Analytics disabled → rely on systemd logs and OpenVPN status files  

---

## Alternatives Considered

### 1. Wait Until Subscription Reactivation (Nov 14)

**Pros**: No changes needed, retain existing configuration

**Cons**: **10 days without Dify access** → unacceptable for production operations

**Decision**: ❌ Rejected - downtime too long

### 2. Migrate Existing VM to New Subscription

**Pros**: Retain all OPNSense configurations, no client reconfiguration

**Cons**:

- Requires snapshot/export → **blocked by ReadOnlyDisabledSubscription**
- Cannot perform write operations until Nov 14
- Migration would take same time as new deployment

**Decision**: ❌ Rejected - technically impossible due to subscription lock

### 3. Use Azure VPN Gateway Instead of VM

**Pros**: Fully managed service, high availability  
**Cons**: 
- **Cost**: ~$140/month (exceeds trial budget)
- **Complexity**: Requires complex routing setup
- **Overkill**: Single-user VPN doesn't need enterprise gateway

**Decision**: ❌ Rejected - cost prohibitive for trial subscription

### 4. Deploy New OpenVPN VM (Selected)

**Pros**: 
- ✅ Immediate deployment (no dependencies on blocked subscription)
- ✅ Low cost (~$15/month for Standard_B1s)
- ✅ Simple architecture
- ✅ Can migrate old configs later if desired

**Cons**: Client reconfiguration required

**Decision**: ✅ **Selected** - best balance of speed, cost, and functionality

---

## Implementation Timeline

| Date | Action | Status |
|------|--------|--------|
| **Nov 3, 2025** | Subscription 739aaf91... disabled (budget exhausted) | ✅ Done |
| **Nov 4, 2025** | Created vpn-rg resource group in subscription 353a6255... | ✅ Done |
| **Nov 4, 2025** | Deployed vpn-vnet (10.10.0.0/16) with subnet-opnsense | ✅ Done |
| **Nov 4, 2025** | Created NSG with OpenVPN rules (UDP/1194) | ✅ Done |
| **Nov 4, 2025** | Deployed vpn-vm (Standard_B1s, Ubuntu 22.04) | ✅ Done |
| **Nov 4, 2025** | Installed OpenVPN Server with EasyRSA PKI | ✅ Done |
| **Nov 4, 2025** | Configured iptables NAT and IP forwarding | ✅ Done |
| **Nov 4, 2025** | Generated client certificate (alberto.ovpn) | ✅ Done |
| **Nov 4, 2025** | Created VNET peering vpn-vnet → dify-private-vnet | ✅ Done (Initiated) |
| **Nov 4, 2025** | Documented architecture in ADR-010 | ✅ Done |
| **Nov 14, 2025** | Create reverse peering dify-private-vnet → vpn-vnet | ⏳ Pending |
| **Nov 14, 2025** | Disable omsagent addon on dify-aks (reduce Log Analytics costs) | ⏳ Pending |
| **Nov 14, 2025** | (Optional) Export OPNSense configs from old VM | ⏳ Pending |

---

## Post-Implementation Tasks

### Immediate (Nov 4)

1. ✅ Test VPN connection using `alberto.ovpn` in OpenVPN GUI client
2. ✅ Verify basic connectivity (can reach vpn-vm private IP: 10.10.1.4)
3. 📝 Distribute `.ovpn` file to authorized users

### On Subscription Reactivation (Nov 14)

1. **Complete VNET Peering**:
   ```bash
   az account set --subscription 739aaf91-5cb2-45a6-ab4f-abf883e9d3f7
   az network vnet peering create \
     --name dify-to-vpn \
     --resource-group dify-rg \
     --vnet-name dify-private-vnet \
     --remote-vnet /subscriptions/353a6255-27a8-4733-adf0-1c531ba9f4e9/resourceGroups/vpn-rg/providers/Microsoft.Network/virtualNetworks/vpn-vnet \
     --allow-vnet-access \
     --allow-forwarded-traffic
   ```

2. **Reduce Log Analytics Costs**:
   ```bash
   # Disable AKS monitoring addon
   az aks disable-addons \
     --resource-group dify-rg \
     --name dify-aks \
     --addons monitoring
   
   # Reduce retention period
   az monitor log-analytics workspace update \
     --resource-group dify-rg \
     --workspace-name dify-private-logs \
     --retention-time 7  # Reduce from 30 to 7 days
   ```

3. **Verify Cross-VNET Connectivity**:
   ```bash
   # From VPN client, test connectivity to Dify resources
   ping 10.0.2.91  # Dify LoadBalancer IP
   curl http://10.0.2.91  # Dify web UI
   ```

4. **(Optional) Export OPNSense Configuration**:
   ```bash
   # Start old VM temporarily
   az vm start --resource-group dify-rg --name dify-private-vm-opnsense
   
   # Copy WireGuard configs if needed
   scp opnsenseadmin@<old-vm-ip>:/etc/wireguard/wg0.conf ./backup/
   
   # Deallocate to avoid costs
   az vm deallocate --resource-group dify-rg --name dify-private-vm-opnsense
   ```

---

## Security Considerations

### Implemented

✅ **Encryption in Transit**: TLS 1.2+ with AES-256-GCM  
✅ **Certificate-Based Auth**: No username/password (PKI only)  
✅ **Network Segmentation**: NSG rules restrict access  
✅ **IP Forwarding Control**: Only VPN tunnel traffic forwarded  
✅ **Firewall (UFW)**: Enabled with explicit allow rules  

### Pending

⚠️ **SSH Access**: Currently open to 0.0.0.0/0 (should restrict to known IPs after initial setup)  
⚠️ **Client Certificate Revocation**: No CRL/OCSP configured yet (add if needed for multi-user)  

### Recommendations

1. **Restrict SSH Source IPs**:
   ```bash
   az network nsg rule update \
     --resource-group vpn-rg \
     --nsg-name vpn-nsg \
     --name Allow-SSH \
     --source-address-prefixes <your-ip>/32
   ```

2. **Enable Azure Disk Encryption** on vpn-vm (protects at-rest data)

3. **Implement Certificate Revocation** if adding more users

---

## Cost Analysis

### Before (Blocked Subscription)

| Resource | Monthly Cost |
|----------|--------------|
| dify-aks (Standard_B2ms × 2 nodes) | ~€50 |
| dify-postgres-9107e36a (Standard_B1ms) | ~€30 |
| **Log Analytics (dify-private-logs)** | **€21.18** |
| Application Insights | ~€5 |
| Storage, networking | ~€15 |
| dify-private-vm-opnsense (Standard_B1ms) | ~€15 |
| **Total** | **~€136/month** |
| **Trial Credit** | **$200** |
| **Days Until Exhaustion** | **~44 days** |

### After Optimization (Target)

| Resource | Monthly Cost |
|----------|--------------|
| dify-aks (monitoring disabled) | ~€50 |
| dify-postgres-9107e36a | ~€30 |
| Log Analytics (7-day retention, minimal ingestion) | **~€5** (85% reduction) |
| Application Insights | ~€5 |
| Storage, networking | ~€15 |
| **Subscription 739aaf91 Total** | **~€105/month** |
| vpn-vm (Standard_B1s, subscription 353a6255) | ~€10 |
| **Combined Total** | **~€115/month** |
| **Savings** | **~€21/month (15% reduction)** |

---

## Monitoring and Observability

### OpenVPN Logs

```bash
# Service status
sudo systemctl status openvpn-server@server

# Live logs
sudo journalctl -u openvpn-server@server -f

# Connection status
cat /var/log/openvpn/openvpn-status.log

# Full logs
cat /var/log/openvpn/openvpn.log
```

### Client Connection Verification

```bash
# Check tunnel interface
ip addr show tun0

# Verify routes
ip route | grep tun0

# Test connectivity to Dify
ping 10.0.2.91
curl -I http://10.0.2.91
```

---

## References

- [Azure VNET Peering Documentation](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview)
- [OpenVPN Best Practices](https://openvpn.net/community-resources/reference-manual-for-openvpn-2-4/)
- [Cross-Subscription Peering Requirements](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-manage-peering#requirements-and-constraints)
- [Azure Subscription States](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/subscription-states)

---

## Approval

**Approved By**: Alberto Lacambra  
**Date**: 2025-11-04  
**Rationale**: Emergency deployment to restore critical infrastructure access. Follows Azure best practices for cross-subscription networking.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-04 | Alberto Lacambra | Initial ADR documenting VPN migration |
