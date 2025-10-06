import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, ExternalLink, Video, FileText } from 'lucide-react';

const resources = [
  {
    id: 1,
    title: "Puppy Socialization Guide",
    description: "Complete guide to socializing your puppy during the critical first 16 weeks.",
    type: "article",
    url: "#",
    category: "Getting Started"
  },
  {
    id: 2,
    title: "Reading Dog Body Language",
    description: "Learn to understand your dog's signals and reactions during socialization.",
    type: "video",
    url: "#",
    category: "Understanding Your Dog"
  },
  {
    id: 3,
    title: "Creating Positive Experiences",
    description: "Tips for making every socialization session a positive learning experience.",
    type: "article",
    url: "#",
    category: "Best Practices"
  },
  {
    id: 4,
    title: "Socialization Checklist",
    description: "Printable checklist of socialization goals and milestones.",
    type: "download",
    url: "#",
    category: "Tools"
  },
  {
    id: 5,
    title: "Dealing with Fearful Dogs",
    description: "Specialized techniques for helping anxious or fearful dogs build confidence.",
    type: "video",
    url: "#",
    category: "Special Cases"
  },
  {
    id: 6,
    title: "Progress Tracking Tips",
    description: "How to effectively track and measure your dog's socialization progress.",
    type: "article",
    url: "#",
    category: "Best Practices"
  }
];

export const Resources = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'download':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const categories = [...new Set(resources.map(r => r.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Training Resources
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Expert guides, videos, and tools to help with your dog's socialization
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources
              .filter(resource => resource.category === category)
              .map(resource => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{resource.title}</span>
                      <div className="flex items-center space-x-2">
                        {getIcon(resource.type)}
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      {resource.type === 'video' ? 'Watch Video' : 
                       resource.type === 'download' ? 'Download' : 'Read Article'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <CardContent className="p-6">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              More Resources Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We're constantly adding new training materials, videos, and guides.
            </p>
            <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-800">
              Subscribe to Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
