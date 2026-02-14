import type { LucideIcon } from 'lucide-react';
import { Code, Palette, Zap, Megaphone, Wrench } from 'lucide-react';

export interface Tool {
  name: string;
  description: string;
  link: string;
  category: 'development' | 'design' | 'productivity' | 'marketing' | 'other';
}

export interface Category {
  id: Tool['category'];
  name: string;
  icon: LucideIcon;
}

export const categories: Category[] = [
  { id: 'development', name: 'Desenvolvimento', icon: Code },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'productivity', name: 'Produtividade', icon: Zap },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'other', name: 'Outras Ferramentas', icon: Wrench },
];

export const tools: Tool[] = [
  // Development
  { name: 'Can I use', description: 'Compatibility tables for HTML, CSS, JS.', link: 'https://caniuse.com/', category: 'development' },
  { name: 'Lorem Ipsum', description: 'Gerador de texto.', link: 'https://www.lipsum.com/', category: 'development' },
  { name: 'JSON Viewer', description: 'Visualizador de JSON.', link: 'http://jsonviewer.stack.hu/', category: 'development' },
  { name: 'JSCompress', description: 'Minificador de JS.', link: 'https://jscompress.com/', category: 'development' },
  { name: 'JS Beautifier', description: 'Embelezador de JS.', link: 'https://beautifier.io/', category: 'development' },
  { name: 'Password Generator', description: 'Gerador de senhas.', link: 'https://www.lastpass.com/pt/features/password-generator', category: 'development' },
  { name: 'QR Code Generator', description: 'Gerador de QR Code.', link: 'https://www.the-qrcode-generator.com/', category: 'development' },
  { name: 'Regex101', description: 'Testador de Regex.', link: 'https://regex101.com/', category: 'development' },
  
  // Design
  { name: 'Canva', description: 'Editor de imagens.', link: 'https://www.canva.com/', category: 'design' },
  { name: 'Remove.bg', description: 'Removedor de fundo de imagens.', link: 'https://www.remove.bg/', category: 'design' },
  { name: 'Coolors', description: 'Paleta de cores.', link: 'https://coolors.co/', category: 'design' },
  { name: 'Unsplash', description: 'Banco de imagens.', link: 'https://unsplash.com/', category: 'design' },
  { name: 'Pexels', description: 'Banco de vídeos.', link: 'https://www.pexels.com/', category: 'design' },
  { name: 'Font Awesome', description: 'Ícones.', link: 'https://fontawesome.com/', category: 'design' },
  { name: 'Google Fonts', description: 'Fontes.', link: 'https://fonts.google.com/', category: 'design' },
  { name: 'FlatIcon', description: 'Ícones.', link: 'https://www.flaticon.com/', category: 'design' },

  // Productivity
  { name: 'Trello', description: 'Gerenciador de tarefas.', link: 'https://trello.com/', category: 'productivity' },
  { name: 'Notion', description: 'Workspace tudo-em-um.', link: 'https://www.notion.so/', category: 'productivity' },
  { name: 'Slack', description: 'Comunicação de equipe.', link: 'https://slack.com/', category: 'productivity' },
  { name: 'Google Drive', description: 'Armazenamento em nuvem.', link: 'https://www.google.com/drive/', category: 'productivity' },
  { name: 'Dropbox', description: 'Armazenamento em nuvem.', link: 'https://www.dropbox.com/', category: 'productivity' },
  { name: 'Evernote', description: 'Anotações.', link: 'https://evernote.com/', category: 'productivity' },
  { name: 'Todoist', description: 'Gerenciador de tarefas.', link: 'https://todoist.com/', category: 'productivity' },
  { name: 'Asana', description: 'Gerenciador de projetos.', link: 'https://asana.com/', category: 'productivity' },

  // Marketing
  { name: 'Mailchimp', description: 'E-mail marketing.', link: 'https://mailchimp.com/', category: 'marketing' },
  { name: 'Hootsuite', description: 'Gerenciador de redes sociais.', link: 'https://www.hootsuite.com/', category: 'marketing' },
  { name: 'Buffer', description: 'Gerenciador de redes sociais.', link: 'https://buffer.com/', category: 'marketing' },
  { name: 'Google Analytics', description: 'Análise de tráfego.', link: 'https://analytics.google.com/', category: 'marketing' },
  { name: 'SEMrush', description: 'Análise de SEO.', link: 'https://www.semrush.com/', category: 'marketing' },
  { name: 'Ahrefs', description: 'Análise de SEO.', link: 'https://ahrefs.com/', category: 'marketing' },
  { name: 'HubSpot', description: 'Automação de marketing.', link: 'https://www.hubspot.com/', category: 'marketing' },
  { name: 'BuzzSumo', description: 'Análise de conteúdo.', link: 'https://buzzsumo.com/', category: 'marketing' },

  // Other
  { name: 'TinyPNG', description: 'Compressor de imagens.', link: 'https://tinypng.com/', category: 'other' },
  { name: 'WeTransfer', description: 'Transferência de arquivos.', link: 'https://wetransfer.com/', category: 'other' },
  { name: 'Grammarly', description: 'Corretor ortográfico.', link: 'https://www.grammarly.com/', category: 'other' },
  { name: 'Smallpdf', description: 'Editor de PDF.', link: 'https://smallpdf.com/', category: 'other' },
  { name: 'Online-convert', description: 'Conversor de arquivos.', link: 'https://www.online-convert.com/', category: 'other' },
  { name: 'Typeform', description: 'Criador de formulários.', link: 'https://www.typeform.com/', category: 'other' },
  { name: 'Calendly', description: 'Agendador de reuniões.', link: 'https://calendly.com/', category: 'other' },
  { name: 'Zapier', description: 'Automação de tarefas.', link: 'https://zapier.com/', category: 'other' },
];
