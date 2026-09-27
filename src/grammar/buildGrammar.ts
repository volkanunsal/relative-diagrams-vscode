import { PATTERNS } from "reladraw";

export interface GrammarRule {
  name?: string;
  match: string;
  captures?: Record<string, { name: string }>;
}

export interface Grammar {
  $schema: string;
  name: string;
  scopeName: string;
  patterns: GrammarRule[];
}

export const SCOPE_FOR_KIND = {
  comment: "comment.line.double-slash.reladraw",
  string: "string.quoted.double.reladraw",
  keyword: "keyword.control.statement.reladraw",
  name: "entity.name.reladraw",
  arrow: "keyword.operator.arrow.reladraw",
  color: "constant.other.color.reladraw",
  attribute: "variable.parameter.attribute.reladraw",
  relation: "keyword.other.relation.reladraw",
  bracket: "punctuation.section.group.reladraw",
} as const;

export function buildGrammar(): Grammar {
  return {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "Reladraw",
    scopeName: "source.reladraw",
    patterns: [
      { name: SCOPE_FOR_KIND.comment, match: PATTERNS.comment },
      { name: SCOPE_FOR_KIND.string, match: PATTERNS.string },
      {
        match: `^\\s*(${PATTERNS.keyword})(?:\\s+(${PATTERNS.word}))?`,
        captures: {
          "1": { name: SCOPE_FOR_KIND.keyword },
          "2": { name: SCOPE_FOR_KIND.name },
        },
      },
      { name: SCOPE_FOR_KIND.arrow, match: PATTERNS.arrow },
      { name: SCOPE_FOR_KIND.color, match: PATTERNS.color },
      { name: SCOPE_FOR_KIND.attribute, match: PATTERNS.attribute },
      { name: SCOPE_FOR_KIND.relation, match: `\\b${PATTERNS.relation}` },
      { name: SCOPE_FOR_KIND.bracket, match: PATTERNS.bracket },
    ],
  };
}
