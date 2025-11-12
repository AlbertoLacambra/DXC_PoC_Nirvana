'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
} from '@mui/material';
import {
  RocketLaunch,
  LibraryBooks,
  Code,
  Description,
  ArrowForward,
  Stars,
  Speed,
  Security,
  Home as HomeIcon,
} from '@mui/icons-material';

export default function ProjectDevelopmentPage() {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back to Home Button */}
      <Box mb={3}>
        <Button
          component={Link}
          href="/"
          startIcon={<HomeIcon />}
          variant="outlined"
        >
          Volver al Home
        </Button>
      </Box>

      {/* Header */}
      <Box mb={6}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Code sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            Project Development
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
          Desarrollo de proyectos basado en especificaciones reutilizables.
          Acelera tu workflow con templates pre-configurados y best practices.
        </Typography>
      </Box>

      {/* Feature Highlights */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 6, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', display: 'flex', alignItems: 'start', gap: 2 }}>
            <Speed sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Desarrollo Rápido
              </Typography>
              <Typography variant="body2">
                Genera proyectos completos en segundos con configuración automática
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 300px', display: 'flex', alignItems: 'start', gap: 2 }}>
            <Security sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Best Practices
              </Typography>
              <Typography variant="body2">
                Specs validadas siguiendo estándares de seguridad y calidad
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 300px', display: 'flex', alignItems: 'start', gap: 2 }}>
            <Stars sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Reutilización
              </Typography>
              <Typography variant="body2">
                Biblioteca de componentes y patrones probados en producción
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Actions */}
      <Box sx={{ display: 'flex', gap: 4, mb: 6, flexWrap: 'wrap' }}>
        {/* Create New Project */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RocketLaunch sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Crear Nuevo Proyecto
                  </Typography>
                  <Chip label="Wizard Interactivo" color="primary" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" color="text.secondary" paragraph>
                Inicia un nuevo proyecto seleccionando el tipo de aplicación y las 
                especificaciones técnicas que deseas incluir.
              </Typography>

              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2" mb={1}>
                  ✅ 6 tipos de proyectos: Next.js, React, Python, Terraform, Azure Functions, Node.js
                </Typography>
                <Typography component="li" variant="body2" mb={1}>
                  ✅ Selección de specs con verificación de compatibilidad
                </Typography>
                <Typography component="li" variant="body2" mb={1}>
                  ✅ Configuración de Git y CI/CD automática
                </Typography>
                <Typography component="li" variant="body2">
                  ✅ Generación de código lista para producción
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                onClick={() => router.push('/projects/new')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 1.5,
                }}
              >
                Comenzar Wizard
              </Button>
            </CardActions>
          </Card>
        </Box>

        {/* Browse Spec Library */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6,
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LibraryBooks sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Biblioteca de Specs
                  </Typography>
                  <Chip label="Explorar & Buscar" color="secondary" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" color="text.secondary" paragraph>
                Explora todas las especificaciones técnicas disponibles, filtra por 
                categorías y descubre componentes reutilizables.
              </Typography>

              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2" mb={1}>
                  📚 Catálogo completo de especificaciones técnicas
                </Typography>
                <Typography component="li" variant="body2" mb={1}>
                  🏷️ Filtrado por tags: Terraform, Git, Security, CI/CD, OAuth
                </Typography>
                <Typography component="li" variant="body2" mb={1}>
                  🔍 Búsqueda avanzada por nombre, descripción y contenido
                </Typography>
                <Typography component="li" variant="body2">
                  📖 Vista detallada con ejemplos de código y dependencias
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                onClick={() => router.push('/specs/browse')}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  py: 1.5,
                }}
              >
                Explorar Biblioteca
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Paper sx={{ p: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📊 Estadísticas de la Plataforma
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              6
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tipos de Proyectos
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              50+
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Specs Disponibles
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Proveedores CI/CD
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              100%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Código Generado
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Documentation Section */}
      <Box mt={6}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Description color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Documentación y Recursos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 250px' }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ py: 1.5, justifyContent: 'flex-start' }}
              >
                📘 Guía de Inicio Rápido
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ py: 1.5, justifyContent: 'flex-start' }}
              >
                🎓 Tutorial de Specs
              </Button>
            </Box>
            <Box sx={{ flex: '1 1 250px' }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ py: 1.5, justifyContent: 'flex-start' }}
              >
                💡 Mejores Prácticas
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
