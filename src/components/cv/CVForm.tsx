import { ProfileData, Education, Experience, Project } from "@/types/cv";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Globe } from "lucide-react";

interface CVFormProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

export const CVForm = ({ data, onChange }: CVFormProps) => {
  const updateField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...data.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateField("education", newEducation);
  };

  const addEducation = () => {
    updateField("education", [...data.education, { school: "", degree: "", years: "" }]);
  };

  const removeEducation = (index: number) => {
    updateField("education", data.education.filter((_, i) => i !== index));
  };

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

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...(data.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    updateField("projects", newProjects);
  };

  const addProject = () => {
    updateField("projects", [...(data.projects || []), { name: "", description: "" }]);
  };

  const removeProject = (index: number) => {
    updateField("projects", (data.projects || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <section className="form-section animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Personal Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <Input
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="input-label">Professional Title</label>
            <Input
              value={data.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Software Engineer"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Email</label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <Input
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label className="input-label">Location</label>
            <Input
              value={data.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
          
          <div>
            <label className="input-label">Professional Summary</label>
            <Textarea
              value={data.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="A brief summary of your professional background..."
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Skills</h2>
        </div>
        
        <div>
          <label className="input-label">Skills (comma-separated)</label>
          <Textarea
            value={data.skills.join(", ")}
            onChange={(e) => updateField("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="JavaScript, React, Node.js, Python..."
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
              <button
                onClick={() => removeExperience(index)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Job Title</label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(index, "title", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="input-label">Company</label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              
              <div>
                <label className="input-label">Years</label>
                <Input
                  value={exp.years}
                  onChange={(e) => updateExperience(index, "years", e.target.value)}
                  placeholder="2020 - Present"
                />
              </div>
              
              <div>
                <label className="input-label">Description</label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  className="min-h-[80px] resize-none"
                />
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
              <button
                onClick={() => removeEducation(index)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div>
                <label className="input-label">School / University</label>
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducation(index, "school", e.target.value)}
                  placeholder="University Name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <label className="input-label">Years</label>
                  <Input
                    value={edu.years}
                    onChange={(e) => updateEducation(index, "years", e.target.value)}
                    placeholder="2016 - 2020"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects (Optional) */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif font-semibold text-foreground">Projects <span className="text-muted-foreground text-sm font-sans">(Optional)</span></h2>
          </div>
          <Button variant="ghost" size="sm" onClick={addProject} className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        
        <div className="space-y-4">
          {(data.projects || []).map((project, index) => (
            <div key={index} className="p-4 bg-secondary/50 rounded-lg space-y-3 relative">
              <button
                onClick={() => removeProject(index)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div>
                <label className="input-label">Project Name</label>
                <Input
                  value={project.name}
                  onChange={(e) => updateProject(index, "name", e.target.value)}
                  placeholder="Project Name"
                />
              </div>
              
              <div>
                <label className="input-label">Description</label>
                <Textarea
                  value={project.description}
                  onChange={(e) => updateProject(index, "description", e.target.value)}
                  placeholder="Brief description of the project..."
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Languages (Optional) */}
      <section className="form-section animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-serif font-semibold text-foreground">Languages <span className="text-muted-foreground text-sm font-sans">(Optional)</span></h2>
        </div>
        
        <div>
          <label className="input-label">Languages (comma-separated)</label>
          <Input
            value={(data.languages || []).join(", ")}
            onChange={(e) => updateField("languages", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            placeholder="English (Native), Spanish (Fluent)..."
          />
        </div>
      </section>
    </div>
  );
};
