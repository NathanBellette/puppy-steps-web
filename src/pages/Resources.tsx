import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, ExternalLink, Video, FileText, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

type ResourceCategory = 'General' | 'People' | 'Dogs' | 'Environments' | 'Noises';
type ResourceType = 'article' | 'video' | 'guide' | 'tool';

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
    id: 2,
    title: "Socialisation Windows: When to Start",
    description: "Understanding the critical periods for socialisation and why timing matters.",
    type: "video",
    category: "General",
    url: "https://www.youtube.com/watch?v=example",
    duration: "15 min"
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
    id: 4,
    title: "Introducing Your Puppy to Different People",
    description: "Step-by-step guide to socialising with men, women, children, and elderly people.",
    type: "video",
    category: "People",
    url: "https://www.youtube.com/watch?v=example",
    duration: "12 min"
  },
  {
    id: 5,
    title: "Socialising with Children: Safety First",
    description: "Important safety tips and techniques for introducing puppies to children.",
    type: "article",
    category: "People",
    url: "https://www.akc.org/expert-advice/training/teaching-kids-to-be-dog-safe/",
    duration: "6 min read"
  },
  {
    id: 6,
    title: "Handling Different Clothing and Accessories",
    description: "How to help your puppy get comfortable with hats, glasses, uniforms, and more.",
    type: "video",
    category: "People",
    url: "https://www.youtube.com/watch?v=example",
    duration: "8 min"
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
    id: 8,
    title: "Small Dog vs Big Dog Socialisation",
    description: "Special considerations for socialising with dogs of different sizes.",
    type: "video",
    category: "Dogs",
    url: "https://www.youtube.com/watch?v=example",
    duration: "10 min"
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
    id: 10,
    title: "Vet Office Visits: Making Them Positive",
    description: "Tips for creating positive associations with veterinary visits.",
    type: "video",
    category: "Environments",
    url: "https://www.youtube.com/watch?v=example",
    duration: "9 min"
  },
  {
    id: 11,
    title: "Car Travel Training",
    description: "How to gradually introduce your puppy to car rides and travel.",
    type: "article",
    category: "Environments",
    url: "https://www.akc.org/expert-advice/training/how-to-teach-your-dog-to-ride-in-a-car/",
    duration: "8 min read"
  },
  {
    id: 12,
    title: "Public Places: Parks, Cafés, and Stores",
    description: "Guidelines for socialising in various public environments.",
    type: "video",
    category: "Environments",
    url: "https://www.youtube.com/watch?v=example",
    duration: "14 min"
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
    id: 14,
    title: "Thunder and Fireworks: Fear Prevention",
    description: "How to prevent and manage noise phobias in puppies.",
    type: "video",
    category: "Noises",
    url: "https://www.youtube.com/watch?v=example",
    duration: "13 min"
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
  article: 'text-blue-600',
  video: 'text-red-600',
  guide: 'text-green-600',
  tool: 'text-orange-600'
};

export const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('General');

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'guide':
        return <Book className="h-5 w-5" />;
      case 'tool':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const categories: ResourceCategory[] = ['General', 'People', 'Dogs', 'Environments', 'Noises'];
  const filteredResources = resources.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Training Resources
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Expert guides, videos, and articles to help with your puppy's socialization
        </p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <span className="text-lg">{categoryEmoji[category]}</span>
            <span>{category}</span>
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className={cn('p-2 rounded-lg bg-gray-100 dark:bg-gray-800', typeColors[resource.type])}>
                  {getIcon(resource.type)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                {resource.type === 'video' ? 'Watch Video' : 
                 resource.type === 'guide' ? 'Read Guide' :
                 resource.type === 'tool' ? 'Get Tool' : 'Read Article'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                More Resources Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We're constantly adding new training materials, videos, and guides. Check back regularly for updates on puppy socialization best practices.
              </p>
              <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>📚 {resources.length} resources available</span>
                <span>•</span>
                <span>Updated weekly</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
