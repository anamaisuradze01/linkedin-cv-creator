import { useState } from "react";
import { ProfileData, Education, Experience, Project } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Globe, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

interface CVFormProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  userId?: string;
  onClearAll?: () => void;
}

export const CVForm = ({ data, onChange, userId, onClearAll }: CVFormProps) => {
  const [regeneratingFields, setRegeneratingFields] = useState<Set<string>>(new Set());

  // Debug logging for userId
  console.log('CVForm received userId:', userId);

  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldKey = (field: string, index?: number) => 
    index !== undefined ? `${field}-${index}` : field;

  const callRegenerateAPI = async (field: 'summary' | 'skills' | 'experience', index?: number) => {
    console.log('Making API call with:', { userId, field, index, BACKEND_URL });
    console.log('Full API URL will be:', `${BACKEND_URL}/api/regenerate?user_id=${userId}&field=${field}${index !== undefined ? `&index=${index}` : ''}`);
    
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "Please log in to use AI regeneration.",
        variant: "destructive",
      });
      return;
    }

    const fieldKey = getFieldKey(field, index);
    setRegeneratingFields(prev => new Set(prev).add(fieldKey));

    try {
      const params = new URLSearchParams({ user_id: userId, field });
      if (index !== undefined) params.append("index", index.toString());

      const res = await fetch(`${BACKEND_URL}/api/regenerate?${params.toString()}`, { 
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === "ok" && json.data) {
        onChange(json.data);
        toast({
          title: "Regenerated!",
          description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated with AI.`,
        });
      } else {
        throw new Error(json.error || "Failed to regenerate content");
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      toast({
        title: "Regeneration failed",
        description: err instanceof Error ? err.message : "Failed to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingFields(prev => {
        const next = new Set(prev);
        next.delete(fieldKey);
        return next;
      });
    }
  };

  // ---------------- Experience ----------------
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...data.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    updateField("experience", newExperience);
  };

  const addExperience = () => {
    updateField("experience", [...data.experience, { title: "", company: "", years: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    updateField("experience", data.experience.filter((_, i) => i !== index));
  };

  // ---------------- Education ----------------
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...data.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateField("education", newEducation);
  };

  const addEducation = () => updateField("education", [...data.education, { school: "", degree: "", years: "" }]);
  const removeEducation = (index: number) => updateField("education", data.education.filter((_, i) => i !== index));

  // ---------------- Projects ----------------
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    updateField("projects", newProjects);
  };

  const addProject = () => updateField("projects", [...(data.projects || []), { name: "", description: "" }]);
  const removeProject = (index: number) => updateField("projects", (data.projects || []).filter((_, i) => i !== index));

  // ---------------- Regenerate Button ----------------
  const RegenerateButton = ({ field, index }: { field: 'summary' | 'skills' | 'experience', index?: number }) => {
    const fieldKey = getFieldKey(field, index);
    const isLoading = regeneratingFields.has(fieldKey);
    
    return (
      <button
        type="button"
        onClick={() => callRegenerateAPI(field, index)}
        disabled={isLoading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Regenerate with AI"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        <span>{isLoading ? "Regenerating..." : "Regenerate"}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {onClearAll && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearAll} className="text-muted-foreground">
            Clear All
          </Button>
        </div>
      )}

      {/* Personal Info */}
      <section className="form-section animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <Input value={data.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="John Doe" />
          </div>
          <div>
            <label className="input-label">Professional Title</label>
            <Input value={data.title} onChange={e => updateField("title", e.target.value)} placeholder="Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Email</label>
              <Input type="email" value={data.email} onChange={e => updateField("email", e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <Input value={data.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
            </div>
          </div>
          <div>
            <label className="input-label">Location</label>
            <Input value={data.location} onChange={e => updateField("location", e.target.value)} placeholder="City, Country" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="input-label">Professional Summary</label>
              <RegenerateButton field="summary" />
            </div>
            <Textarea value={data.summary} onChange={e => updateField("summary", e.target.value)} placeholder="A brief summary..." className="min-h-[100px] resize-none" />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif font-semibold text-foreground">Skills</h2>
          </div>
          <RegenerateButton field="skills" />
        </div>
        <div>
          <label className="input-label">Skills (comma-separated)</label>
          <Textarea
            value={data.skills.join(", ")}
            onChange={e => updateField("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="JavaScript, React, Node.js..."
            className="min-h-[80px] resize-none"
          />
        </div>
      </section>

      {/* Experience */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif font-semibold text-foreground">Experience</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={addExperience} className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="p-4 bg-secondary/50 rounded-lg space-y-3 relative">
              <button onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Job Title</label>
                  <Input value={exp.title} onChange={e => updateExperience(index, "title", e.target.value)} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="input-label">Company</label>
                  <Input value={exp.company} onChange={e => updateExperience(index, "company", e.target.value)} placeholder="Company Name" />
                </div>
              </div>

              <div>
                <label className="input-label">Years</label>
                <Input value={exp.years} onChange={e => updateExperience(index, "years", e.target.value)} placeholder="2020 - Present" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="input-label">Description</label>
                  <RegenerateButton field="experience" index={index} />
                </div>
                <Textarea value={exp.description} onChange={e => updateExperience(index, "description", e.target.value)} placeholder="Responsibilities and achievements..." className="min-h-[80px] resize-none" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif font-semibold text-foreground">Education</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={addEducation} className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="p-4 bg-secondary/50 rounded-lg space-y-3 relative">
              <button onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="input-label">School / University</label>
                <Input value={edu.school} onChange={e => updateEducation(index, "school", e.target.value)} placeholder="University Name" />
              </div>
              <div>
                <label className="input-label">Degree</label>
                <Input value={edu.degree} onChange={e => updateEducation(index, "degree", e.target.value)} placeholder="Bachelor of Science in Computer Science" />
              </div>
              <div>
                <label className="input-label">Years</label>
                <Input value={edu.years} onChange={e => updateEducation(index, "years", e.target.value)} placeholder="2016 - 2020" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif font-semibold text-foreground">Projects</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={addProject} className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-4">
          {(data.projects || []).map((project, index) => (
            <div key={index} className="p-4 bg-secondary/50 rounded-lg space-y-3 relative">
              <button onClick={() => removeProject(index)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="input-label">Project Name</label>
                <Input value={project.name} onChange={e => updateProject(index, "name", e.target.value)} placeholder="Project Name" />
              </div>
              <div>
                <label className="input-label">Description</label>
                <Textarea value={project.description} onChange={e => updateProject(index, "description", e.target.value)} placeholder="Brief description of the project..." className="min-h-[60px] resize-none" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Languages</h2>
        </div>
        <div>
          <label className="input-label">Languages (comma-separated)</label>
          <Input
            value={(data.languages || []).join(", ")}
            onChange={e => updateField("languages", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="English, Spanish, French..."
          />
        </div>
      </section>
    </div>
  );
};
