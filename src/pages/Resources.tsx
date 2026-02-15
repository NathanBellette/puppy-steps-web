import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink, FileText, Book, Mail } from 'lucide-react';

type ResourceCategory = 'General' | 'People' | 'Dogs' | 'Environments' | 'Noises';
type ResourceType = 'article' | 'guide' | 'tool';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
  duration: string;
}

const resources: Resource[] = [
  // General Resources
  {
    id: 1,
    title: "Puppy Socialisation: The Complete Guide",
    description: "Learn the fundamentals of socialising your puppy during the critical early weeks.",
    type: "article",
    category: "General",
    url: "https://www.akc.org/expert-advice/training/puppy-socialization/",
    duration: "10 min read"
  },
  {
    id: 3,
    title: "Positive Reinforcement Techniques",
    description: "How to use treats and praise effectively during socialisation sessions.",
    type: "article",
    category: "General",
    url: "https://www.aspca.org/pet-care/dog-care/dog-training",
    duration: "8 min read"
  },
  
  // People Resources
  {
    id: 5,
    title: "Socialising with Children: Safety First",
    description: "Important safety tips and techniques for introducing puppies to children.",
    type: "article",
    category: "People",
    url: "https://www.akc.org/expert-advice/training/teaching-kids-to-be-dog-safe/",
    duration: "6 min read"
  },
  
  // Dogs Resources
  {
    id: 7,
    title: "Meeting Other Dogs: Body Language Guide",
    description: "Learn to read canine body language and ensure safe dog-to-dog introductions.",
    type: "article",
    category: "Dogs",
    url: "https://www.akc.org/expert-advice/training/read-dog-body-language/",
    duration: "12 min read"
  },
  {
    id: 9,
    title: "Puppy Playgroups: Benefits and Setup",
    description: "How to organize or join puppy playgroups for effective socialisation.",
    type: "article",
    category: "Dogs",
    url: "https://www.akc.org/expert-advice/training/puppy-classes/",
    duration: "7 min read"
  },
  
  // Environments Resources
  {
    id: 11,
    title: "Car Travel Training",
    description: "How to gradually introduce your puppy to car rides and travel.",
    type: "article",
    category: "Environments",
    url: "https://www.akc.org/expert-advice/training/how-to-teach-your-dog-to-ride-in-a-car/",
    duration: "8 min read"
  },
  
  // Noises Resources
  {
    id: 13,
    title: "Sound Desensitisation Techniques",
    description: "Progressive methods for introducing your puppy to various sounds.",
    type: "article",
    category: "Noises",
    url: "https://www.akc.org/expert-advice/training/desensitizing-your-dog-to-loud-noises/",
    duration: "11 min read"
  },
  {
    id: 15,
    title: "Household Noises: Vacuum, Doorbell, etc.",
    description: "Making everyday household sounds less scary for your puppy.",
    type: "article",
    category: "Noises",
    url: "https://www.akc.org/expert-advice/training/desensitizing-to-household-noises/",
    duration: "6 min read"
  }
];

const categoryEmoji: Record<ResourceCategory, string> = {
  General: '📚',
  People: '👥',
  Dogs: '🐕',
  Environments: '🏠',
  Noises: '🔊'
};

const typeColors: Record<ResourceType, string> = {
  article: 'text-primary-600',
  guide: 'text-emerald-600',
  tool: 'text-amber-600'
};

export const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('General');

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'guide':
        return <Book className="h-5 w-5" />;
      case 'tool':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const categoryItems = (['General', 'People', 'Dogs', 'Environments', 'Noises'] as ResourceCategory[]).map(cat => ({
    value: cat,
    label: cat,
    emoji: categoryEmoji[cat],
  }));
  const filteredResources = resources.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Training Resources
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Expert guides and articles to help with your puppy's socialisation
        </p>
      </div>

      {/* Category Selector */}
      <SegmentedControl
        items={categoryItems}
        value={selectedCategory}
        onChange={setSelectedCategory}
      />

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className={cn('p-2 rounded-lg bg-slate-100 dark:bg-slate-800', typeColors[resource.type])}>
                  {getIcon(resource.type)}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {resource.duration}
                </span>
              </div>
              <CardTitle className="text-base">
                {resource.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(resource.url, '_blank')}
              >
                {resource.type === 'guide' ? 'Read Guide' :
                 resource.type === 'tool' ? 'Get Tool' : 'Read Article'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggestion Card */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="h-12 w-12 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Have a suggestion?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Know a great resource that should be listed here? We'd love to hear from you.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = 'mailto:support@puppysteps.app?subject=Resource%20Suggestion'}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send a Suggestion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
