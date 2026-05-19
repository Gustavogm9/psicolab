import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Grid3X3, LayoutGrid, Rows3, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioImagem } from "@/hooks/usePortfolioImagens";

type LayoutType = 'grid' | 'masonry' | 'carousel';

interface PortfolioGalleryProps {
  imagens: PortfolioImagem[];
  corPrimaria: string;
  onImageClick?: (imagemId: string) => void;
}

export function PortfolioGallery({ imagens, corPrimaria, onImageClick }: PortfolioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Extrair categorias únicas
  const categorias = useMemo(() => {
    const cats = imagens
      .map(img => img.categoria)
      .filter((cat): cat is string => !!cat);
    return [...new Set(cats)];
  }, [imagens]);

  // Filtrar imagens
  const imagensFiltradas = useMemo(() => {
    if (!categoriaFiltro) return imagens;
    return imagens.filter(img => img.categoria === categoriaFiltro);
  }, [imagens, categoriaFiltro]);

  // Separar destaques
  const imagensDestaques = useMemo(() => 
    imagensFiltradas.filter(img => img.destaque), 
    [imagensFiltradas]
  );

  if (!imagens || imagens.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    if (onImageClick) {
      onImageClick(imagensFiltradas[index].id);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imagensFiltradas.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imagensFiltradas.length) % imagensFiltradas.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  const nextCarouselSlide = () => {
    const maxIndex = Math.max(0, imagensFiltradas.length - 3);
    setCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevCarouselSlide = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  // Renderizar card de imagem
  const renderImageCard = (imagem: PortfolioImagem, index: number, isMasonry = false) => (
    <Card
      key={imagem.id}
      className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
      onClick={() => openLightbox(index)}
    >
      <div className={`relative overflow-hidden ${isMasonry ? '' : 'aspect-video'}`}>
        <img
          src={imagem.imagem_url}
          alt={`${imagem.titulo}${imagem.descricao ? ` - ${imagem.descricao}` : ''}`}
          loading="lazy"
          className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${isMasonry ? 'h-auto' : 'h-full'}`}
        />
        {imagem.destaque && (
          <Badge
            className="absolute top-2 right-2"
            style={{ backgroundColor: corPrimaria, color: 'white' }}
          >
            Destaque
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg mb-1">{imagem.titulo}</h3>
            {imagem.descricao && (
              <p className="text-sm opacity-90 line-clamp-2">{imagem.descricao}</p>
            )}
          </div>
        </div>
      </div>
      {imagem.categoria && (
        <div className="p-3 border-t">
          <Badge variant="outline" style={{ borderColor: `${corPrimaria}50` }}>
            {imagem.categoria}
          </Badge>
        </div>
      )}
    </Card>
  );

  // Layout Grid padrão
  const renderGridLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {imagensFiltradas.map((imagem, index) => renderImageCard(imagem, index))}
    </div>
  );

  // Layout Masonry (Pinterest-style)
  const renderMasonryLayout = () => {
    const columns: PortfolioImagem[][] = [[], [], []];
    imagensFiltradas.forEach((img, idx) => {
      columns[idx % 3].push(img);
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-6">
            {column.map((imagem) => {
              const originalIndex = imagensFiltradas.findIndex(i => i.id === imagem.id);
              return renderImageCard(imagem, originalIndex, true);
            })}
          </div>
        ))}
      </div>
    );
  };

  // Layout Carrossel
  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{ transform: `translateX(-${carouselIndex * (100 / 3 + 2)}%)` }}
        >
          {imagensFiltradas.map((imagem, index) => (
            <div 
              key={imagem.id} 
              className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              {renderImageCard(imagem, index)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navegação do carrossel */}
      {imagensFiltradas.length > 3 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg hover:shadow-xl z-10"
            onClick={prevCarouselSlide}
            disabled={carouselIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-lg hover:shadow-xl z-10"
            onClick={nextCarouselSlide}
            disabled={carouselIndex >= imagensFiltradas.length - 3}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(imagensFiltradas.length / 3) }).map((_, idx) => (
          <button
            key={idx}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: Math.floor(carouselIndex / 1) === idx ? corPrimaria : `${corPrimaria}30`
            }}
            onClick={() => setCarouselIndex(idx * 1)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Controles de Layout e Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Filtro por Categoria */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={categoriaFiltro === null ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFiltro(null)}
              style={categoriaFiltro === null ? { backgroundColor: corPrimaria } : {}}
            >
              Todas
            </Button>
            {categorias.map((cat) => (
              <Button
                key={cat}
                variant={categoriaFiltro === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(cat)}
                style={categoriaFiltro === cat ? { backgroundColor: corPrimaria } : {}}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        {/* Seletor de Layout */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={layout === 'grid' ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout('grid')}
            className="h-8 w-8 p-0"
            title="Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'masonry' ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout('masonry')}
            className="h-8 w-8 p-0"
            title="Masonry"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'carousel' ? "default" : "ghost"}
            size="sm"
            onClick={() => setLayout('carousel')}
            className="h-8 w-8 p-0"
            title="Carrossel"
          >
            <Rows3 className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>

      {/* Destaques em banner (apenas se houver e não estiver filtrando) */}
      {imagensDestaques.length > 0 && !categoriaFiltro && layout !== 'carousel' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: corPrimaria }}>
            <span className="w-8 h-1 rounded-full" style={{ backgroundColor: corPrimaria }} />
            Destaques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {imagensDestaques.slice(0, 2).map((imagem) => {
              const originalIndex = imagensFiltradas.findIndex(i => i.id === imagem.id);
              return (
                <Card
                  key={imagem.id}
                  className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300"
                  onClick={() => openLightbox(originalIndex)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={imagem.imagem_url}
                      alt={imagem.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <Badge className="mb-2" style={{ backgroundColor: corPrimaria }}>
                        Destaque
                      </Badge>
                      <h3 className="font-semibold text-xl mb-1">{imagem.titulo}</h3>
                      {imagem.descricao && (
                        <p className="text-sm opacity-90">{imagem.descricao}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Galeria Principal */}
      {layout === 'grid' && renderGridLayout()}
      {layout === 'masonry' && renderMasonryLayout()}
      {layout === 'carousel' && renderCarouselLayout()}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Fechar"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-50"
            aria-label="Próxima"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div
            className="max-w-7xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagensFiltradas[currentIndex].imagem_url}
              alt={`${imagensFiltradas[currentIndex].titulo}${imagensFiltradas[currentIndex].descricao ? ` - ${imagensFiltradas[currentIndex].descricao}` : ''}`}
              loading="lazy"
              className="max-w-full max-h-[70vh] object-contain mb-4"
            />
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">{imagensFiltradas[currentIndex].titulo}</h2>
              {imagensFiltradas[currentIndex].descricao && (
                <p className="text-lg opacity-90 mb-2">{imagensFiltradas[currentIndex].descricao}</p>
              )}
              {imagensFiltradas[currentIndex].categoria && (
                <Badge
                  variant="outline"
                  className="border-white text-white"
                >
                  {imagensFiltradas[currentIndex].categoria}
                </Badge>
              )}
              <p className="text-sm opacity-70 mt-4">
                {currentIndex + 1} / {imagensFiltradas.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
