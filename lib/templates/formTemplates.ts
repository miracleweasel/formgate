// lib/templates/formTemplates.ts
// Pre-configured form templates for quick form creation

import type { FormField } from "@/lib/validation/fields";
import { t } from "@/lib/i18n";

export type TemplateId = "blank" | "contact" | "bugReport" | "featureRequest" | "feedback" | "support";

export interface FormTemplate {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  fields: FormField[];
}

export function getFormTemplates(): FormTemplate[] {
  const tpl = t.templates;

  return [
    {
      id: "blank",
      name: tpl.blank.name,
      description: tpl.blank.description,
      icon: "📄",
      fields: [],
    },
    {
      id: "contact",
      name: tpl.contact.name,
      description: tpl.contact.description,
      icon: "📧",
      fields: [
        { type: "text", name: "name", label: "名前", required: true, placeholder: "" },
        { type: "email", name: "email", label: "メールアドレス", required: true, placeholder: "" },
        { type: "textarea", name: "message", label: "メッセージ", required: true, placeholder: "" },
      ],
    },
    {
      id: "bugReport",
      name: tpl.bugReport.name,
      description: tpl.bugReport.description,
      icon: "🐛",
      fields: [
        { type: "text", name: "name", label: "名前", required: true, placeholder: "" },
        { type: "email", name: "email", label: "メールアドレス", required: true, placeholder: "" },
        {
          type: "select",
          name: "severity",
          label: "重要度",
          required: true,
          placeholder: "",
          options: [
            { value: "low", label: "低" },
            { value: "medium", label: "中" },
            { value: "high", label: "高" },
            { value: "critical", label: "緊急" },
          ],
        },
        { type: "textarea", name: "description", label: "説明", required: true, placeholder: "" },
        { type: "textarea", name: "steps", label: "再現手順", required: false, placeholder: "" },
      ],
    },
    {
      id: "featureRequest",
      name: tpl.featureRequest.name,
      description: tpl.featureRequest.description,
      icon: "💡",
      fields: [
        { type: "text", name: "name", label: "名前", required: true, placeholder: "" },
        { type: "email", name: "email", label: "メールアドレス", required: true, placeholder: "" },
        {
          type: "select",
          name: "priority",
          label: "優先度",
          required: true,
          placeholder: "",
          options: [
            { value: "low", label: "低" },
            { value: "medium", label: "中" },
            { value: "high", label: "高" },
          ],
        },
        { type: "textarea", name: "description", label: "機能の説明", required: true, placeholder: "" },
      ],
    },
    {
      id: "feedback",
      name: tpl.feedback.name,
      description: tpl.feedback.description,
      icon: "📝",
      fields: [
        { type: "text", name: "name", label: "名前", required: false, placeholder: "" },
        { type: "email", name: "email", label: "メールアドレス", required: false, placeholder: "" },
        {
          type: "select",
          name: "rating",
          label: "評価",
          required: true,
          placeholder: "",
          options: [
            { value: "1", label: "1 - 非常に悪い" },
            { value: "2", label: "2 - 悪い" },
            { value: "3", label: "3 - 普通" },
            { value: "4", label: "4 - 良い" },
            { value: "5", label: "5 - 非常に良い" },
          ],
        },
        {
          type: "select",
          name: "category",
          label: "カテゴリ",
          required: false,
          placeholder: "",
          options: [
            { value: "product", label: "製品" },
            { value: "support", label: "サポート" },
            { value: "docs", label: "ドキュメント" },
            { value: "other", label: "その他" },
          ],
        },
        { type: "textarea", name: "comment", label: "コメント", required: false, placeholder: "" },
      ],
    },
    {
      id: "support",
      name: tpl.support.name,
      description: tpl.support.description,
      icon: "🎧",
      fields: [
        { type: "text", name: "name", label: "名前", required: true, placeholder: "" },
        { type: "email", name: "email", label: "メールアドレス", required: true, placeholder: "" },
        {
          type: "radio",
          name: "urgency",
          label: "緊急度",
          required: true,
          placeholder: "",
          options: [
            { value: "low", label: "低い" },
            { value: "normal", label: "通常" },
            { value: "urgent", label: "緊急" },
          ],
        },
        { type: "text", name: "subject", label: "件名", required: true, placeholder: "" },
        { type: "textarea", name: "description", label: "説明", required: true, placeholder: "" },
      ],
    },
  ];
}
