import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';
import { FinalAnalysis } from '@/types';

interface AIReasoningProps {
  analysis: FinalAnalysis;
}

export const AIReasoning: React.FC<AIReasoningProps> = ({ analysis }) => {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-slate-900">AI Reasoning</h3>
      </div>

      {/* Decision */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-full bg-red-100 p-2">
            <CheckCircle className="h-4 w-4 text-red-600" />
          </div>
          <h4 className="font-semibold text-slate-900">Decision</h4>
        </div>
        <p className="text-lg font-bold text-red-900 ml-10">{analysis.verdict}</p>
      </div>

      {/* Justification */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-900 mb-2">Justification</h4>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-700 leading-relaxed">{analysis.reasoning_path}</p>
        </div>
      </div>

      {/* Recommended Actions */}
      {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recommended Actions</h4>
          <ol className="space-y-2">
            {analysis.recommended_actions.map((action: { priority: number; action: string; rationale: string }, index: number) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-slate-700 pt-0.5">{action.action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
