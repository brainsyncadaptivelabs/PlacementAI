-- Database initialization queries
SELECT 1;

INSERT INTO curated_resources (skill_keyword, title, resource_type, url, description, relevance, difficulty, estimated_study_hours, priority, category, prerequisites) VALUES
('concurrency', 'Java Concurrency in Practice', 'BOOK', 'https://jcip.net/', 'Definitive guide to writing concurrent programs in Java.', 95, 'Advanced', 40, 'High', 'Java', 'Java Basics'),
('concurrenthashmap', 'Spring & Java Concurrency Docs', 'DOCUMENTATION', 'https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html', 'Official Java Documentation for ConcurrentHashMap.', 90, 'Intermediate', 2, 'High', 'Java', 'Java Collections'),
('hashmap', 'How HashMap Works in Java', 'VIDEO', 'https://www.youtube.com/watch?v=c3RVW3KGIIk', 'Detailed explanation of HashMap hashing, collisions, and bucket tree-ification.', 85, 'Intermediate', 1, 'Medium', 'Java', 'Java Collections'),
('virtual dom', 'React Virtual DOM Reconciliation Docs', 'DOCUMENTATION', 'https://react.dev/reference/react', 'Official React documentation detailing Virtual DOM reconciliation.', 92, 'Intermediate', 3, 'High', 'React', 'React Basics'),
('useeffect', 'Complete Guide to React useEffect', 'ARTICLE', 'https://overreacted.io/a-complete-guide-to-useeffect/', 'Detailed deep dive into useEffect hook mechanics by Dan Abramov.', 90, 'Intermediate', 2, 'High', 'React', 'React Hooks'),
('cap theorem', 'CAP Theorem Deep Dive', 'ARTICLE', 'https://en.wikipedia.org/wiki/CAP_theorem', 'Fundamental article explaining consistency, availability, and partition tolerance in distributed databases.', 95, 'Advanced', 4, 'High', 'System Design', 'Networking'),
('caching', 'System Design Primer - Caching', 'ARTICLE', 'https://github.com/donnemartin/system-design-primer#cache', 'Comprehensive guide to caching strategies, eviction policies, and cache invalidation.', 95, 'Intermediate', 5, 'High', 'System Design', 'Databases');

