import { SurveyData, TriageStatus } from '@/store/useStore';
import { API_URL } from '@/lib/config';

export async function submitToTriage(
  image: string | null,
  survey: SurveyData
): Promise<{ status: TriageStatus; conditionName?: string }> {
  try {
    const response = await fetch(`${API_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        survey
      }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      let errorDetail = errText;
      try {
        const json = JSON.parse(errText);
        if (json.detail) errorDetail = json.detail;
      } catch (e) {}
      throw new Error(errorDetail);
    }
    
    const data = await response.json();
    return { status: data.danger_level || 'Routine', conditionName: data.predicted_class };
  } catch (error: any) {
    console.error("FastAPI fetch failed:", error);
    throw new Error(`Failed to communicate with backend (${API_URL}): ${error.message}`);
  }
}
