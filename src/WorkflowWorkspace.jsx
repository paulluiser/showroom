import { useRef } from 'react';
import { workflows } from './content';
import WorkflowIllustration from './WorkflowIllustration';

export default function WorkflowWorkspace({ cycle, reduced }) {
  const tabs = useRef([]);
  const playbackLabel = cycle.stopped ? 'Resume automatic workflows' : 'Pause automatic workflows';

  function handleTabKey(event, index) {
    let next;
    switch (event.key) {
      case 'ArrowLeft': next = (index + workflows.length - 1) % workflows.length; break;
      case 'ArrowRight': next = (index + 1) % workflows.length; break;
      case 'Home': next = 0; break;
      case 'End': next = workflows.length - 1; break;
      default: return;
    }
    event.preventDefault();
    cycle.choose(next);
    tabs.current[next].focus();
  }

  return (
    <div className="ai-workspace" ref={cycle.host}>
      <div className="workflow-navigation" ref={cycle.navigation}>
        <div className="workflow-tabs" role="tablist" aria-label="AI workflows">
          {workflows.map(({ label }, index) => (
            <button key={label} ref={node => { tabs.current[index] = node; }} type="button" role="tab"
              id={`workflow-tab-${index}`} aria-selected={cycle.index === index}
              aria-controls={`workflow-view-${index}`} tabIndex={cycle.index === index ? 0 : -1}
              onClick={() => cycle.choose(index)} onKeyDown={event => handleTabKey(event, index)}>
              {label}<span className="workflow-timer" aria-hidden="true" />
            </button>
          ))}
        </div>
        {!reduced && (
          <button className="workflow-playback" type="button" onClick={cycle.toggle}
            aria-label={playbackLabel} title={playbackLabel}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
              {cycle.stopped ? <path d="M5 3.5 12 8l-7 4.5z" strokeLinejoin="round" /> : <path d="M6 4v8m4-8v8" strokeLinecap="round" />}
            </svg>
          </button>
        )}
      </div>
      <div className="workflow-views">
        {workflows.map((workflow, index) => {
          const active = cycle.index === index;
          return (
            <div className="workflow-view" key={workflow.title} data-active={active} data-workflow={index}
              id={`workflow-view-${index}`} role="tabpanel" aria-labelledby={`workflow-tab-${index}`}
              tabIndex={active ? 0 : -1} aria-hidden={!active} inert={!active}>
              <div className="workflow-summary"><h3>{workflow.title}</h3><p>{workflow.description}</p></div>
              <ol className="workflow-flow" aria-label="How I work">
                {workflow.steps.map(([kind, title, description]) => (
                  <li className="workflow-step" key={kind}>
                    <WorkflowIllustration kind={kind} />
                    <div className="workflow-step-copy"><h4>{title}</h4><p>{description}</p></div>
                  </li>
                ))}
              </ol>
              <dl className="workflow-proof" aria-label="Work and review">
                {workflow.proof.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
