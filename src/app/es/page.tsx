import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import FaqPageJsonLd from "@/components/FaqPageJsonLd";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import WebSiteJsonLd from "@/components/WebSiteJsonLd";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";

const tools = [
  { title: "Comprimir PDF", desc: "Reduce el tamaño del archivo", icon: "compress", href: "/es/compress" },
  { title: "Unir PDF", desc: "Combina varios PDF en uno", icon: "merge", href: "/es/merge" },
  { title: "Dividir PDF", desc: "Extrae páginas o divide", icon: "split", href: "/es/split" },
  { title: "Imagen a PDF", desc: "Convierte JPG, PNG a PDF", icon: "image", href: "/es/image-to-pdf" },
  { title: "Editar PDF", desc: "Añade texto y formas", icon: "edit", href: "/es/edit-pdf" },
  { title: "Proteger PDF", desc: "Encripta con contraseña", icon: "lock", href: "/es/protect" },
  { title: "Firmar PDF", desc: "Añade tu firma digital", icon: "signature", href: "/es/sign" },
  { title: "OCR PDF", desc: "Extrae texto de escaneados", icon: "scan", href: "/es/ocr-pdf" },
  { title: "PDF a Word", desc: "Convierte a DOCX", icon: "fileWord", href: "/es/pdf-to-word" },
  { title: "Comprimir PNG", desc: "Reduce el peso del archivo", icon: "compress", href: "/es/compress" },
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
        <div className="absolute inset-0 bg-gradient-to-b bg-[var(--accent-subtle)] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] leading-tight mb-4">
            Herramientas <span className="text-[var(--accent)]">PDF</span> Gratuitas
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Más de 40 herramientas PDF gratuitas. Comprime, une, divide, edita y más. 
            Todo en tu navegador — sin subidas, sin servidores.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/es/tools"
              className="px-8 py-3.5 bg-[var(--accent)] text-white font-semibold rounded-[var(--r-xl)] hover:bg-[var(--accent-hover)] transition shadow-lg shadow-indigo-600/25"
            >
              Explorar Herramientas
            </Link>
            <Link
              href="/premium"
              className="px-8 py-3.5 bg-[var(--premium)] text-white font-semibold rounded-[var(--r-xl)] hover:opacity-90 transition shadow-lg shadow-amber-600/25"
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
              className="group block p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-[var(--r-lg)] border bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent)] mb-4">
                <Icon name={tool.icon as IconName} size={21} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
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
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex justify-center mb-3"><Icon name="lock" size={26} className="text-[var(--muted)]" /></div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">100% Privado</h3>
            <p className="text-sm text-[var(--muted)]">Tus archivos nunca salen de tu dispositivo. Todo el procesamiento ocurre en tu navegador.</p>
          </div>
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex justify-center mb-3"><Icon name="zap" size={26} className="text-[var(--muted)]" /></div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Sin esperas</h3>
            <p className="text-sm text-[var(--muted)]">Procesamiento instantáneo. No hay colas de espera ni tiempos de carga de servidor.</p>
          </div>
          <div className="p-6 rounded-[var(--r-lg)] border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex justify-center mb-3"><Icon name="star" size={26} className="text-[var(--muted)]" /></div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Gratis</h3>
            <p className="text-sm text-[var(--muted)]">Más de 40 herramientas gratuitas. Sin registro, sin tarjeta de crédito.</p>
          </div>
        </div>
      </section>
    </>
  );
}
