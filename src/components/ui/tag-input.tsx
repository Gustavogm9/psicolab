import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ id, value, onChange, placeholder, className }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Convert the comma-separated string to an array of tags
  const tags = React.useMemo(() => {
    return value
      ? value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
  }, [value]);

  const updateTags = (newTags: string[]) => {
    onChange(newTags.join(", "));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Se o usuário digitou uma vírgula
    if (val.includes(",")) {
      const parts = val.split(",");
      const newTag = parts[0].trim();
      
      if (newTag && !tags.includes(newTag)) {
        updateTags([...tags, newTag]);
      }
      
      setInputValue(parts.slice(1).join(",").trim());
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      if (newTag) {
        if (!tags.includes(newTag)) {
          updateTags([...tags, newTag]);
        }
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove o último tag se o input estiver vazio e pressionar Backspace
      updateTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTags(tags.filter((t) => t !== tagToRemove));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex flex-wrap gap-2 p-2 border border-input bg-background rounded-md min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200",
        className
      )}
    >
      {tags.map((tag, index) => (
        <Badge
          key={`${tag}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pl-2.5 pr-1 py-1 text-sm bg-primary-soft hover:bg-primary-soft/80 text-primary border border-primary/10 rounded-full font-medium transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="rounded-full p-0.5 hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Adiciona o termo se desfocar e houver texto
          const newTag = inputValue.trim();
          if (newTag) {
            if (!tags.includes(newTag)) {
              updateTags([...tags, newTag]);
            }
            setInputValue("");
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none border-none text-sm placeholder:text-muted-foreground focus:ring-0 p-0.5"
      />
    </div>
  );
}
