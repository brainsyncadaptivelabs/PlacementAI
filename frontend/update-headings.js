const fs = require('fs');
const paths = [
  'src/app/dashboard/ats/analysis/page.tsx', 
  'src/app/dashboard/ats/analysis/[id]/page.tsx'
];

paths.forEach(p => {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/<CardTitle className="([^"]*)">/g, (match, classes) => {
    let newClasses = classes.replace(/font-bold/g, 'font-black')
                            .replace(/font-extrabold/g, 'font-black')
                            .replace(/text-muted-foreground/g, 'text-foreground');
    return `<CardTitle className="${newClasses}">`;
  });
  fs.writeFileSync(p, content);
});
