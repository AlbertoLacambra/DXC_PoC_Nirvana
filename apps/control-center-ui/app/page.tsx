export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Cloud Control Center
        </h1>
        <p className="text-center text-lg mb-4">
          Plataforma unificada de desarrollo Cloud impulsada por IA
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🚀 Vibe Coding</h2>
            <p className="text-muted-foreground">
              Generación de proyectos completos desde lenguaje natural
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">📚 Knowledge Portal</h2>
            <p className="text-muted-foreground">
              Asistente RAG con documentación técnica
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">💰 FinOps</h2>
            <p className="text-muted-foreground">
              Analytics y optimización de costos
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
