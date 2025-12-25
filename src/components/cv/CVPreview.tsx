import { ProfileData } from "@/types/cv";
import { Mail, Phone, MapPin } from "lucide-react";
import { forwardRef } from "react";

interface CVPreviewProps {
  data: ProfileData;
}

export const CVPreview = forwardRef<HTMLDivElement, CVPreviewProps>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      className="cv-paper w-full max-w-[210mm] mx-auto p-8 md:p-12 shadow-cv rounded-sm"
    >
      {/* Header */}
      <header className="border-b border-cv-border pb-6 mb-6">
        <h1 className="cv-heading text-3xl md:text-4xl font-serif font-bold mb-2">
          {data.fullName || "Your Name"}
        </h1>
        <p className="cv-accent text-lg font-medium mb-4">
          {data.title || "Professional Title"}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm cv-muted">
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{data.location}</span>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="cv-heading text-lg font-serif font-semibold mb-3 uppercase tracking-wider">
            Summary
          </h2>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="cv-heading text-lg font-serif font-semibold mb-4 uppercase tracking-wider">
            Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex flex-wrap justify-between items-start mb-1">
                  <h3 className="font-semibold text-[hsl(var(--cv-heading))]">{exp.title || "Job Title"}</h3>
                  <span className="cv-muted text-sm">{exp.years}</span>
                </div>
                <p className="cv-accent font-medium text-sm mb-2">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm leading-relaxed cv-muted">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="cv-heading text-lg font-serif font-semibold mb-4 uppercase tracking-wider">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex flex-wrap justify-between items-start mb-1">
                  <h3 className="font-semibold text-[hsl(var(--cv-heading))]">{edu.school || "School Name"}</h3>
                  <span className="cv-muted text-sm">{edu.years}</span>
                </div>
                <p className="cv-accent text-sm">{edu.degree}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="cv-heading text-lg font-serif font-semibold mb-3 uppercase tracking-wider">
            Skills
          </h2>
          <div>
            {data.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  marginRight: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="cv-heading text-lg font-serif font-semibold mb-4 uppercase tracking-wider">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-semibold text-[hsl(var(--cv-heading))]">{project.name}</h3>
                <p className="text-sm cv-muted">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <section>
          <h2 className="cv-heading text-lg font-serif font-semibold mb-3 uppercase tracking-wider">
            Languages
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {data.languages.map((language, index) => (
              <span key={index} className="cv-muted">{language}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
});

CVPreview.displayName = "CVPreview";
