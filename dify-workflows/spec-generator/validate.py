"""
Validation script for Spec Generator bot
Validates spec.md, plan.md, and tasks.md output
"""

import re
import json
from typing import Dict, List


def validate_spec(spec_md: str) -> Dict:
    """Validate spec.md structure and content"""
    
    errors = []
    warnings = []
    
    # Check user stories
    stories = re.findall(r'### User Story \d+:', spec_md)
    if len(stories) < 3:
        warnings.append(f"Only {len(stories)} user stories (recommend 3-7)")
    elif len(stories) > 10:
        warnings.append(f"Too many user stories ({len(stories)}), consider grouping")
    
    # Check Given/When/Then scenarios
    scenarios = re.findall(r'\*\*Given\*\*.*?\*\*When\*\*.*?\*\*Then\*\*', spec_md, re.DOTALL)
    if len(scenarios) == 0:
        errors.append("No Given/When/Then scenarios found")
    
    # Check success criteria
    criteria = re.findall(r'\*\*SC-\d+\*\*:', spec_md)
    if len(criteria) < 3:
        warnings.append(f"Only {len(criteria)} success criteria (recommend 3-10)")
    
    # Check for vague success criteria (bad patterns)
    bad_patterns = ['should be', 'good', 'better', 'fast', 'easy', 'simple', 'quickly']
    vague_found = []
    for pattern in bad_patterns:
        if pattern.lower() in spec_md.lower():
            vague_found.append(pattern)
    
    if vague_found:
        warnings.append(f"Vague terms found in success criteria: {', '.join(vague_found)}")
    
    # Check for [NEEDS CLARIFICATION] markers
    if '[NEEDS CLARIFICATION]' in spec_md:
        errors.append("Contains [NEEDS CLARIFICATION] markers - must resolve")
    
    # Check for numbers in success criteria (measurable targets)
    has_numbers = bool(re.search(r'SC-\d+.*?(\d+%|\d+ms|\d+ seconds?|\d+ hours?|\d+ days?|<\d+|\>\d+)', spec_md))
    if not has_numbers:
        warnings.append("Success criteria may lack measurable targets (no numbers/percentages found)")
    
    # Check priorities (P1, P2, P3)
    priorities = re.findall(r'\(P[123]\)', spec_md)
    if len(priorities) != len(stories):
        warnings.append("Not all user stories have priority classification (P1/P2/P3)")
    
    # Check functional requirements
    requirements = re.findall(r'\*\*FR-\d+\*\*:', spec_md)
    if len(requirements) == 0:
        errors.append("No functional requirements (FR-XXX) found")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'metrics': {
            'user_stories': len(stories),
            'scenarios': len(scenarios),
            'success_criteria': len(criteria),
            'requirements': len(requirements),
            'priorities': len(priorities)
        }
    }


def validate_plan(plan_md: str) -> Dict:
    """Validate plan.md structure"""
    
    errors = []
    warnings = []
    
    # Check required sections
    required_sections = [
        'Tech Stack',
        'Constitution Check',
        'API Contracts',
        'Data Models',
        'Implementation Phases',
        'Testing Strategy',
        'Security Considerations'
    ]
    
    missing_sections = []
    for section in required_sections:
        if section not in plan_md:
            missing_sections.append(section)
    
    if missing_sections:
        if 'API Contracts' in missing_sections or 'Data Models' in missing_sections:
            warnings.append(f"Recommended sections missing: {', '.join(missing_sections)}")
        else:
            errors.append(f"Required sections missing: {', '.join(missing_sections)}")
    
    # Check for JSON examples (API contracts should have examples)
    if '```json' not in plan_md and 'API Contracts' in plan_md:
        warnings.append("API Contracts section exists but no JSON examples found")
    
    # Check for SQL schemas (data models should have schemas)
    if '```sql' not in plan_md and 'Data Models' in plan_md:
        warnings.append("Data Models section exists but no SQL schemas found")
    
    # Check tech stack justification
    if 'Tech Stack' in plan_md:
        # Look for justification keywords
        justification_keywords = ['because', 'why', 'reason', 'benefit', 'advantage']
        has_justification = any(keyword in plan_md.lower() for keyword in justification_keywords)
        if not has_justification:
            warnings.append("Tech Stack may lack justification (no 'why' explanations found)")
    
    # Check for applied specs
    if 'Constitution Check' in plan_md:
        spec_references = re.findall(r'(Git Flow|Security|IaC|FinOps)', plan_md)
        if len(spec_references) == 0:
            warnings.append("Constitution Check exists but no specs referenced")
    
    # Check implementation phases
    phases = re.findall(r'Phase \d+:', plan_md)
    if len(phases) < 2:
        warnings.append("Implementation should have at least 2 phases (setup + core)")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'metrics': {
            'phases': len(phases),
            'json_examples': plan_md.count('```json'),
            'sql_schemas': plan_md.count('```sql')
        }
    }


def validate_tasks(tasks_md: str) -> Dict:
    """Validate tasks.md structure"""
    
    errors = []
    warnings = []
    
    # Check task format
    tasks = re.findall(r'#### 🔨 Task \d+\.\d+:', tasks_md)
    if len(tasks) == 0:
        errors.append("No tasks found (should have Task X.Y format)")
    
    # Check for estimated time
    time_estimates = re.findall(r'\*\*Estimated Time\*\*:\s*(\d+)', tasks_md)
    
    if time_estimates:
        time_ints = [int(t) for t in time_estimates]
        avg_time = sum(time_ints) / len(time_ints)
        max_time = max(time_ints)
        
        if avg_time > 8:
            warnings.append(f"Average task time {avg_time:.1f}h (recommend <8h, subdivide large tasks)")
        
        if max_time > 8:
            warnings.append(f"Largest task is {max_time}h (should be subdivided into <8h tasks)")
        
        # Check if any tasks are too small (<2h)
        small_tasks = [t for t in time_ints if t < 2]
        if len(small_tasks) > len(time_ints) * 0.3:  # >30% are small
            warnings.append(f"{len(small_tasks)} tasks <2h (consider combining small tasks)")
    else:
        errors.append("No time estimates found (tasks should have Estimated Time)")
    
    # Check for dependencies
    if 'Dependencies' not in tasks_md:
        warnings.append("No task dependencies specified")
    
    # Check for definition of done
    if 'Definition of Done' not in tasks_md:
        errors.append("Missing Definition of Done for tasks")
    
    # Check for files to modify
    if 'Files to create/modify' not in tasks_md:
        warnings.append("Tasks should specify files to create/modify")
    
    # Check for test requirements
    test_keywords = ['unit test', 'integration test', 'e2e test', 'tests pass']
    has_tests = any(keyword in tasks_md.lower() for keyword in test_keywords)
    if not has_tests:
        warnings.append("No test requirements found in tasks")
    
    # Check for success criteria mapping
    sc_references = re.findall(r'SC-\d+', tasks_md)
    if len(sc_references) == 0:
        warnings.append("Tasks should reference success criteria (SC-XXX)")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'metrics': {
            'total_tasks': len(tasks),
            'avg_time': sum(int(t) for t in time_estimates) / len(time_estimates) if time_estimates else 0,
            'max_time': max(int(t) for t in time_estimates) if time_estimates else 0,
            'sc_references': len(sc_references)
        }
    }


def validate_all(spec_md: str, plan_md: str, tasks_md: str) -> Dict:
    """
    Validate all three files
    
    Returns:
        dict: Validation results with 'valid', 'spec', 'plan', 'tasks', 'summary'
    """
    
    spec_validation = validate_spec(spec_md)
    plan_validation = validate_plan(plan_md)
    tasks_validation = validate_tasks(tasks_md)
    
    all_valid = (
        spec_validation['valid'] and 
        plan_validation['valid'] and 
        tasks_validation['valid']
    )
    
    total_errors = (
        len(spec_validation['errors']) + 
        len(plan_validation['errors']) + 
        len(tasks_validation['errors'])
    )
    
    total_warnings = (
        len(spec_validation['warnings']) + 
        len(plan_validation['warnings']) + 
        len(tasks_validation['warnings'])
    )
    
    # Cross-validation: Check consistency between files
    cross_validation_warnings = []
    
    # Check if success criteria in spec match references in tasks
    spec_criteria = set(re.findall(r'SC-(\d+)', spec_md))
    tasks_criteria = set(re.findall(r'SC-(\d+)', tasks_md))
    
    unreferenced_criteria = spec_criteria - tasks_criteria
    if unreferenced_criteria:
        cross_validation_warnings.append(
            f"Success criteria not referenced in tasks: SC-{', SC-'.join(sorted(unreferenced_criteria))}"
        )
    
    # Check if user stories in spec match task organization
    spec_stories = len(re.findall(r'### User Story \d+:', spec_md))
    tasks_stories = len(re.findall(r'### User Story \d+:', tasks_md))
    
    if spec_stories != tasks_stories:
        cross_validation_warnings.append(
            f"Mismatch: {spec_stories} user stories in spec, {tasks_stories} in tasks"
        )
    
    return {
        'valid': all_valid,
        'spec': spec_validation,
        'plan': plan_validation,
        'tasks': tasks_validation,
        'cross_validation': {
            'warnings': cross_validation_warnings
        },
        'summary': {
            'total_errors': total_errors,
            'total_warnings': total_warnings + len(cross_validation_warnings),
            'quality_score': calculate_quality_score(
                spec_validation, 
                plan_validation, 
                tasks_validation,
                total_errors,
                total_warnings
            )
        }
    }


def calculate_quality_score(spec_val: Dict, plan_val: Dict, tasks_val: Dict, 
                            errors: int, warnings: int) -> float:
    """
    Calculate overall quality score (0-100)
    
    Scoring:
    - Start with 100
    - -10 per error
    - -2 per warning
    - Bonus points for good metrics
    """
    
    score = 100.0
    
    # Penalties
    score -= errors * 10
    score -= warnings * 2
    
    # Bonus for good metrics
    spec_metrics = spec_val.get('metrics', {})
    
    # Bonus for sufficient user stories (3-7 is ideal)
    stories = spec_metrics.get('user_stories', 0)
    if 3 <= stories <= 7:
        score += 5
    
    # Bonus for good success criteria coverage
    criteria = spec_metrics.get('success_criteria', 0)
    if criteria >= 5:
        score += 5
    
    # Bonus for measurable criteria (checked in validation)
    if 'Success criteria may lack measurable targets' not in str(spec_val.get('warnings', [])):
        score += 5
    
    # Bonus for proper task sizing
    tasks_metrics = tasks_val.get('metrics', {})
    avg_time = tasks_metrics.get('avg_time', 0)
    if 3 <= avg_time <= 6:  # Sweet spot for task size
        score += 5
    
    # Ensure score is in 0-100 range
    score = max(0, min(100, score))
    
    return round(score, 1)


# Main function for Dify Code Node
def main(args: Dict) -> Dict:
    """
    Main function called by Dify Code Node
    
    Args:
        args: dict with 'spec_md', 'plan_md', 'tasks_md'
    
    Returns:
        dict: Validation results
    """
    
    spec_md = args.get('spec_md', '')
    plan_md = args.get('plan_md', '')
    tasks_md = args.get('tasks_md', '')
    
    result = validate_all(spec_md, plan_md, tasks_md)
    
    return {
        'result': json.dumps(result, indent=2)
    }
