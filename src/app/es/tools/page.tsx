import Link from "next/link";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import SoftwareAppJsonLd from "@/components/SoftwareAppJsonLd";
import ToolSearch from "@/components/ToolSearch";

export const metadata = {
  title: "Todas las Herramientas PDF Gratuitas | PDFTools",
  description: "Explora todas las herramientas PDF gratuitas en línea: comprimir, unir, dividir, editar, firmar, convertir y más.",
};

const toolCategories = [
  {
    name: "Convertir y Comprimir",
    desc: "Transforma tus archivos sin perder calidad",
    tools: [
      { name: "Comprimir PDF", desc: "Reduce el tamaño del PDF al instante", icon: "📦", href: "/es/compress" },
      { name: "Unir PDF", desc: "Combina varios archivos en uno solo", icon: "🔗", href: "/es/merge" },
      { name: "Dividir PDF", desc: "Separa páginas o rangos de tu documento", icon: "✂️", href: "/es/split" },
      { name: "Imagen a PDF", desc: "Convierte fotos JPG y PNG en documentos PDF", icon: "🖼️", href: "/es/image-to-pdf" },
      { name: "PDF a Imágenes", desc: "Exporta páginas PDF como imágenes PNG o JPG", icon: "📸", href: "/pdf-to-images" },
      { name: "PDF a Word", desc: "Convierte documentos PDF a formato DOCX editable", icon: "📄", href: "/pdf-to-word" },
      { name: "Word a PDF", desc: "Convierte documentos DOCX a PDF", icon: "📝", href: "/word-to-pdf" },
      { name: "PDF a Excel", desc: "Extrae tablas y datos a hojas de cálculo", icon: "📊", href: "/pdf-to-excel" },
      { name: "HTML a PDF", desc: "Guarda páginas web o código HTML como PDF", icon: "🌐", href: "/html-to-pdf" },
      { name: "Reparar PDF", desc: "Recupera y arregla documentos PDF dañados", icon: "🩹", href: "/repair-pdf" },
    ],
  },
  {
    name: "Editar y Organizar",
    desc: "Reorganiza y personaliza tus páginas",
    tools: [
      { name: "PDF Studio (Multi-Paso)", desc: "Ajusta, borra páginas, firma y optimiza sin subir de nuevo", icon: "⚡", href: "/studio" },
      { name: "Editar PDF", desc: "Añade texto, formas y anotaciones", icon: "✏️", href: "/es/edit-pdf" },
      { name: "Organizar Páginas", desc: "Reordena visualmente las páginas", icon: "📑", href: "/organize" },
      { name: "Eliminar Páginas", desc: "Quita páginas innecesarias", icon: "🗑️", href: "/delete-pages" },
      { name: "Rotar PDF", desc: "Gira páginas 90, 180 o 270 grados", icon: "🔄", href: "/rotate" },
      { name: "Recortar PDF", desc: "Ajusta los márgenes visualmente", icon: "📐", href: "/crop" },
      { name: "Numerar Páginas", desc: "Añade números de página personalizados", icon: "🔢", href: "/add-page-numbers" },
      { name: "Marca de Agua", desc: "Inserta texto o sellos de agua", icon: "💧", href: "/watermark" },
    ],
  },
  {
    name: "Seguridad y Firma",
    desc: "Protege y valida tus documentos",
    tools: [
      { name: "Proteger PDF", desc: "Añade contraseña y encriptación fuerte", icon: "🔒", href: "/protect" },
      { name: "Desbloquear PDF", desc: "Quita restricciones y contraseñas", icon: "🔓", href: "/unlock" },
      { name: "Firmar PDF", desc: "Dibuja o sube tu firma digitalmente", icon: "✍️", href: "/sign" },
      { name: "Redactar PDF", desc: "Censura información confidencial", icon: "⬛", href: "/redact" },
      { name: "Aplanar PDF", desc: "Combina capas y formularios en un PDF fijo", icon: "📄", href: "/flatten-pdf" },
    ],
  },
];

export default function EsToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <SoftwareAppJsonLd
        name="Herramientas PDF en Español | PDFTools"
        description="Explora todas las herramientas PDF gratuitas en español."
        url="https://allaboutpdfediting.xyz/es/tools"
        image="https://allaboutpdfediting.xyz/opengraph-image.png"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", item: "https://allaboutpdfediting.xyz/es" },
          { name: "Herramientas", item: "https://allaboutpdfediting.xyz/es/tools" },
        ]}
      />

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-4">
          Todas las Herramientas <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">PDF</span>
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-6">
          Más de 40 utilidades 100% privadas y gratuitas. Tus archivos se procesan en tu navegador sin subirse a ningún servidor.
        </p>
        <ToolSearch />
      </div>

      <div className="space-y-12">
        {toolCategories.map((category) => (
          <div key={category.name} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{category.name}</h2>
              <p className="text-sm text-[var(--muted)]">{category.desc}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.tools.map((tool) => (
                <Link
                  key={tool.href + tool.name}
                  href={tool.href}
                  className="p-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <h3 className="font-bold text-[var(--foreground)] group-hover:text-indigo-500 transition-colors text-base mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{tool.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--card-border)]/50 flex items-center justify-between text-xs font-semibold text-indigo-500">
                    <span>Abrir herramienta</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
