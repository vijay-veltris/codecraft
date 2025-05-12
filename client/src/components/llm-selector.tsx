import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

export type LLMProvider = 'openai' | 'codellama' | 'phind-codellama' | 'wizardcoder';

interface LLMSelectorProps {
  value: LLMProvider;
  onChange: (value: LLMProvider) => void;
  className?: string;
}

const llmOptions: { value: LLMProvider; label: string; description: string }[] = [
  {
    value: 'openai',
    label: 'OpenAI GPT-4',
    description: 'Most capable model, requires API key'
  },
  {
    value: 'codellama',
    label: 'CodeLlama',
    description: 'Open source code model, runs locally'
  },
  {
    value: 'phind-codellama',
    label: 'Phind-CodeLlama',
    description: 'Enhanced CodeLlama model'
  },
  {
    value: 'wizardcoder',
    label: 'WizardCoder',
    description: 'Specialized for code generation'
  }
];

export function LLMSelector({ value, onChange, className }: LLMSelectorProps) {
  return (
    <div className={className}>
      <Label htmlFor="llm-select">AI Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="llm-select" className="w-full">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          {llmOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 