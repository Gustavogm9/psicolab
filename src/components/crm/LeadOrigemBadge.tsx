import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeadOrigemBadgeProps {
  lead: {
    resposta_id: string | null;
    origem: string;
    resposta?: {
      questionario?: {
        titulo: string;
        slug: string;
      };
    };
  };
}

export function LeadOrigemBadge({ lead }: LeadOrigemBadgeProps) {
  const navigate = useNavigate();

  if (lead.resposta_id && lead.resposta?.questionario) {
    return (
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-primary/10"
        onClick={() => navigate(`/diagnosticos/respostas/${lead.resposta?.questionario?.slug}`)}
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        Diagnóstico: {lead.resposta.questionario.titulo}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <UserPlus className="w-3 h-3 mr-1" />
      Lead Manual
    </Badge>
  );
}
