import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Menu, Layout, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MenuItem {
  id: string;
  nome: string;
  link: string;
}

interface NavbarFooterConfigProps {
  navbarMenuItems: MenuItem[];
  navbarCtaTexto: string;
  navbarCtaLink: string;
  footerTextoSobre: string;
  mostrarSecaoConteudos: boolean;
  onChangeNavbarMenuItems: (items: MenuItem[]) => void;
  onChangeNavbarCtaTexto: (texto: string) => void;
  onChangeNavbarCtaLink: (link: string) => void;
  onChangeFooterTextoSobre: (texto: string) => void;
  onChangeMostrarSecaoConteudos: (mostrar: boolean) => void;
}

export function NavbarFooterConfig({
  navbarMenuItems,
  navbarCtaTexto,
  navbarCtaLink,
  footerTextoSobre,
  mostrarSecaoConteudos,
  onChangeNavbarMenuItems,
  onChangeNavbarCtaTexto,
  onChangeNavbarCtaLink,
  onChangeFooterTextoSobre,
  onChangeMostrarSecaoConteudos
}: NavbarFooterConfigProps) {
  const adicionarMenuItem = () => {
    const novoItem: MenuItem = {
      id: crypto.randomUUID(),
      nome: "",
      link: ""
    };
    onChangeNavbarMenuItems([...navbarMenuItems, novoItem]);
  };

  const removerMenuItem = (id: string) => {
    onChangeNavbarMenuItems(navbarMenuItems.filter(item => item.id !== id));
  };

  const atualizarMenuItem = (id: string, campo: 'nome' | 'link', valor: string) => {
    onChangeNavbarMenuItems(navbarMenuItems.map(item => 
      item.id === id ? { ...item, [campo]: valor } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Navbar Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Navegação (Navbar)
          </CardTitle>
          <CardDescription>
            Configure o menu e botão de ação do topo da página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Menu Items */}
          <div className="space-y-4">
            <Label className="text-base">Itens do Menu</Label>
            {navbarMenuItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Nome do Link</Label>
                      <Input
                        value={item.nome}
                        onChange={(e) => atualizarMenuItem(item.id, 'nome', e.target.value)}
                        placeholder="Ex: Serviços, Sobre, Contato"
                      />
                    </div>
                    <div>
                      <Label>Link / Âncora</Label>
                      <Input
                        value={item.link}
                        onChange={(e) => atualizarMenuItem(item.id, 'link', e.target.value)}
                        placeholder="Ex: #servicos, #sobre, #contato"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removerMenuItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
            
            {navbarMenuItems.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                Nenhum item de menu adicionado
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={adicionarMenuItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item ao Menu
            </Button>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Use âncoras (#) para navegação interna: #servicos, #sobre, #contato.
                Links externos também são suportados.
              </AlertDescription>
            </Alert>
          </div>

          {/* CTA do Navbar */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base">Botão de Ação (CTA)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={navbarCtaTexto}
                  onChange={(e) => onChangeNavbarCtaTexto(e.target.value)}
                  placeholder="Ex: Agendar Consulta"
                />
              </div>
              <div>
                <Label>Link do Botão</Label>
                <Input
                  value={navbarCtaLink}
                  onChange={(e) => onChangeNavbarCtaLink(e.target.value)}
                  placeholder="Ex: #contato ou URL externo"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Rodapé (Footer)
          </CardTitle>
          <CardDescription>
            Configure o texto sobre você que aparece no rodapé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Texto "Sobre" no Rodapé</Label>
            <Textarea
              value={footerTextoSobre}
              onChange={(e) => onChangeFooterTextoSobre(e.target.value)}
              placeholder="Breve descrição sobre você e seu trabalho para o rodapé..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Um resumo curto que aparecerá na coluna "Sobre" do rodapé
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Switch
              checked={mostrarSecaoConteudos}
              onCheckedChange={onChangeMostrarSecaoConteudos}
            />
            <div>
              <Label>Mostrar Seção de Conteúdos no Rodapé</Label>
              <p className="text-xs text-muted-foreground">
                Exibe uma seção "Conteúdos" com links para artigos/blog (se configurado)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
