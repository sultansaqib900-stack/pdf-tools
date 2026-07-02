import Link from "next/link";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import WebSiteJsonLd from "@/components/WebSiteJsonLd";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

const tools = [
  { title: "Comprimir PDF", desc: "Reduce el tamaño del archivo", icon: "📦", href: "/es/compress", gradient: "from-blue-500 to-blue-600" },
  { title: "Unir PDF", desc: "Combina varios PDF en uno", icon: "🔗", href: "/es/merge", gradient: "from-emerald-500 to-emerald-600" },
  { title: "Dividir PDF", desc: "Extrae páginas o divide", icon: "✂️", href: "/es/split", gradient: "from-purple-500 to-purple-600" },
  { title: "Imagen a PDF", desc: "Convierte JPG, PNG a PDF", icon: "🖼️", href: "/es/image-to-pdf", gradient: "from-amber-500 to-amber-600" },
  { title: "Editar PDF", desc: "Añade texto y formas", icon: "✏️", href: "/es/edit-pdf", gradient: "from-orange-500 to-orange-600" },
  { title: "Proteger PDF", desc: "Encripta con contraseña", icon: "🔒", href: "/es/protect", gradient: "from-violet-500 to-violet-600" },
  { title: "Firmar PDF", desc: "Añade tu firma digital", icon: "✍️", href: "/es/sign", gradient: "from-pink-500 to-pink-600" },
  { title: "OCR PDF", desc: "Extrae texto de escaneados", icon: "🔍", href: "/es/ocr-pdf", gradient: "from-purple-500 to-purple-600" },
  { title: "PDF a Word", desc: "Convierte a DOCX", icon: "📄", href: "/es/pdf-to-word", gradient: "from-blue-500 to-blue-700" },
  { title: "Comprimir PNG", desc: "Reduce el peso del archivo", icon: "📦", href: "/es/compress", gradient: "from-indigo-500 to-indigo-600" },
];

export default function EsHomePage() {
  return (
    <>
      <SoftwareAppJsonLd
        name="PDFTools - Herramientas PDF Gratuitas"
        description="Más de 40 herramientas PDF gratuitas. Todo en tu navegador."
        url="https://allaboutpdfediting.xyz/es"
        image="https://allaboutpdfediting.xyz/opengraph-image.png"
      />
      <BreadcrumbJsonLd items={[{ name: "Inicio", item: "https://allaboutpdfediting.xyz/es" }]} />
      <FaqPageJsonLd />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            Herramientas <span className="text-indigo-500">PDF</span> Gratuitas
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Más de 40 herramientas PDF gratuitas. Comprime, une, divide, edita y más. 
            Todo en tu navegador — sin subidas, sin servidores.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/es/tools"
              className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25"
            >
              Explorar Herramientas
            </Link>
            <Link
              href="/premium"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-700 transition shadow-lg shadow-amber-600/25"
            >
              Ir a Premium
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                {tool.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-indigo-500 transition-colors">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
          ¿Por qué usar PDFTools?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">100% Privado</h3>
            <p className="text-sm text-[var(--muted)]">Tus archivos nunca salen de tu dispositivo. Todo el procesamiento ocurre en tu navegador.</p>
          </div>
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Sin esperas</h3>
            <p className="text-sm text-[var(--muted)]">Procesamiento instantáneo. No hay colas de espera ni tiempos de carga de servidor.</p>
          </div>
          <div className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-3xl mb-3">🆓</div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Gratis</h3>
            <p className="text-sm text-[var(--muted)]">Más de 40 herramientas gratuitas. Sin registro, sin tarjeta de crédito.</p>
          </div>
        </div>
      </section>
    </>
  );
}
