import React from "react";
import { LearningResource } from "../constants/learning-resources";

interface LearningResourcesProps {
  resources: LearningResource[];
}

export const LearningResources = ({ resources }: LearningResourcesProps) => {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getTypeIcon = (type: LearningResource['type']) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'book':
        return '📚';
      case 'course':
        return '🎓';
      case 'practice':
        return '💪';
      default:
        return '📖';
    }
  };

  const getDifficultyColor = (difficulty: LearningResource['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <span className="text-xl">📚</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Recommended Learning Resources
          </h2>
          <p className="text-sm text-muted-foreground">
            Curated materials to help you improve in your focus areas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">
                {getTypeIcon(resource.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {resource.title}
                  </h3>
                  <svg
                    className="size-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full ${getDifficultyColor(
                      resource.difficulty
                    )}`}
                  >
                    {resource.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {resource.estimatedTime}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize border border-border">
                    {resource.type}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-semibold text-foreground">Pro Tip:</span> Focus on resources that match your areas for improvement. Start with beginner-level materials and progress to advanced topics as you build confidence.
        </p>
      </div>
    </div>
  );
};
