import { format, parseISO } from 'date-fns';

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    return dateString;
  }
}

export function formatShortDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMM yyyy');
  } catch (e) {
    return dateString;
  }
}

export function getConfidenceBadge(confidence) {
  switch (confidence?.toLowerCase()) {
    case 'high':
      return { label: 'High Confidence', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'moderate':
      return { label: 'Moderate Confidence', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'low':
      return { label: 'Low Confidence (Uncertain)', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    default:
      return { label: 'Insufficient Evidence', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
}

export function getSeverityBadge(severity) {
  switch (severity?.toLowerCase()) {
    case 'mild':
    case 'low':
      return { label: 'Mild / Low', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'moderate':
      return { label: 'Moderate Severity', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'severe':
    case 'high':
      return { label: 'Severe / Action Urgent', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    default:
      return { label: 'Uncertain', color: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}

