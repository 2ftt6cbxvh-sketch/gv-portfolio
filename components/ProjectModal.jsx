"use client";
import { useEffect } from "react";

/**
 * Glassmorphic Project Showcase Lightbox Modal
 * Displays full project details, image/preview, stack tags, live demo links.
 * Listens for Esc key press and outside clicks to close cleanly.
 */
export default function ProjectModal({ project, onClose, accentColor = "var(--color-accent)" }) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="project-modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="project-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ "--modal-accent": accentColor }}
      >
        <button className="project-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="project-modal-header">
          <span className="project-modal-index">PROJECT / {project.index || "01"}</span>
          <h2 className="project-modal-title">{project.title}</h2>
        </div>

        {project.imageUrl && (
          <div className="project-modal-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.imageUrl} alt={project.title} />
          </div>
        )}

        <p className="project-modal-desc">
          {project.description && project.description.trim() !== ""
            ? project.description
            : "An engineered product focused on high performance, clean architecture, and intuitive user experience."}
        </p>

        {project.stack && project.stack.length > 0 && (
          <div className="project-modal-stack">
            <span className="project-modal-label">TECH STACK</span>
            <div className="project-modal-tags">
              {project.stack.map((tech, i) => (
                <span className="tag" key={i}>{tech}</span>
              ))}
            </div>
          </div>
        )}

        <div className="project-modal-footer">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-modal-btn project-modal-btn--primary"
            >
              <span>Launch Live Project</span>
              <span className="project-modal-arrow">↗</span>
            </a>
          ) : (
            <span className="project-modal-status">Internal / Repository Project</span>
          )}
          <button className="project-modal-btn project-modal-btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
