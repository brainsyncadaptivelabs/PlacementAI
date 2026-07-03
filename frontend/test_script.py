import re

path = r'c:\Users\likit\Desktop\PlacementAI\frontend\src\app\dashboard\profile\edit-profile-dialog.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add theme object definition after handleSave
theme_def = """
  const getTheme = () => {
    if (user?.role === "RECRUITER") return {
      main: "#832838",
      light: "rgba(131, 40, 56, 0.1)",
      lighter: "rgba(131, 40, 56, 0.05)",
      border: "rgba(131, 40, 56, 0.2)",
      text: "#832838"
    };
    if (user?.role === "PLACEMENT_OFFICER") return {
      main: "#7B61FF",
      light: "rgba(123, 97, 255, 0.1)",
      lighter: "rgba(123, 97, 255, 0.05)",
      border: "rgba(123, 97, 255, 0.2)",
      text: "#7B61FF"
    };
    return {
      main: "#6366f1",
      light: "rgba(99, 102, 241, 0.1)",
      lighter: "rgba(99, 102, 241, 0.05)",
      border: "rgba(99, 102, 241, 0.2)",
      text: "#6366f1"
    };
  };
  const t = getTheme();
"""
content = content.replace("  return (\n    <Dialog", theme_def + "\n  return (\n    <Dialog")

# Replace DialogContent style
content = content.replace(
    'style={{ "--theme-color": user?.role === "RECRUITER" ? "#832838" : "#6366f1" } as React.CSSProperties}',
    'style={{ "--theme-color": t.main } as React.CSSProperties}'
)

# Function to replace className strings that contain #832838
def replace_classnames(match):
    full_str = match.group(0)
    # Extract the string inside className=" "
    inner = match.group(1)
    # Replace the hardcoded colors with tailwind arbitrary variable syntax using t.main etc
    # We will just change them to inline styles where appropriate or use dynamic classnames
    
    # Actually, a much simpler approach:
    # We can replace `#832838` with `${t.main}` and convert to template literal.
    
    # E.g. bg-[#832838] -> bg-[${t.main}]
    # Wait, tailwind CANNOT compile dynamic classes like bg-[${t.main}].
    # Tailwind MUST see the full class name at build time!
    return full_str

# Wait! Tailwind DOES NOT support dynamic classes like `text-[${t.main}]`. 
# It will purge them!
