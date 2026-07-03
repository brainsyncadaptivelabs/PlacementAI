import re

path = r'c:\Users\likit\Desktop\PlacementAI\frontend\src\components\layout\AppLayout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """  return (
    <SidebarProvider>
      <div 
        className="flex min-h-screen w-full bg-transparent"
        style={{ "--accent": role === "RECRUITER" ? "#832838" : undefined } as React.CSSProperties}
      >"""

new_str = """  return (
    <SidebarProvider>
      {role === "PLACEMENT_OFFICER" && (
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --bg-primary: #171827 !important;
            --bg-secondary: #1C1D2C !important;
            --bg-surface: #222539 !important;
            --bg-elevated: #2A2D43 !important;
            --bg-hover: #2A2D43 !important;
            --text-primary: #FFFFFF !important;
            --text-secondary: #CBD5E1 !important;
            --text-muted: #94A3B8 !important;
            --accent: #7B61FF !important;
            --border-subtle: rgba(255, 255, 255, 0.05) !important;
            --border-focus: rgba(123, 97, 255, 0.2) !important;
            --background: #171827 !important;
            --foreground: #FFFFFF !important;
            --card: #222539 !important;
            --card-foreground: #FFFFFF !important;
            --popover: #222539 !important;
            --popover-foreground: #FFFFFF !important;
            --primary: #7B61FF !important;
            --primary-foreground: #ffffff !important;
            --secondary: #2A2D43 !important;
            --secondary-foreground: #FFFFFF !important;
            --muted: #1C1D2C !important;
            --muted-foreground: #94A3B8 !important;
            --border: rgba(255, 255, 255, 0.05) !important;
            --input: #2A2D43 !important;
            --ring: rgba(123, 97, 255, 0.2) !important;
            --sidebar: #1C1D2C !important;
            --sidebar-border: rgba(255, 255, 255, 0.05) !important;
            --sidebar-foreground: #FFFFFF !important;
            color-scheme: dark !important;
          }
          body {
            background-color: var(--background) !important;
            color: var(--foreground) !important;
            background-image: none !important;
          }
        `}} />
      )}
      <div 
        className={`flex min-h-screen w-full bg-transparent ${role === "PLACEMENT_OFFICER" ? "dark" : ""}`}
        style={{ "--accent": role === "RECRUITER" ? "#832838" : (role === "PLACEMENT_OFFICER" ? "#7B61FF" : undefined) } as React.CSSProperties}
      >"""

if old_str in content:
    content = content.replace(old_str, new_str)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced AppLayout.")
else:
    print("Could not find the exact string.")
