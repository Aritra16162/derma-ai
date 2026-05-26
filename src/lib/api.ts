import { SurveyData, TriageStatus } from '@/store/useStore';
import { API_URL } from '@/lib/config';

export async function submitToTriage(
  image: string | null,
  survey: SurveyData,
  previousDiagnosis?: string
): Promise<{ status: TriageStatus; conditionName?: string; geaSummary?: string; geaDetails?: string }> {
  try {
    const response = await fetch(`${API_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        survey,
        previous_diagnosis: previousDiagnosis
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
    return { 
      status: data.danger_level || 'Routine', 
      conditionName: data.predicted_class,
      geaSummary: data.gea_summary,
      geaDetails: data.gea_details
    };
  } catch (error: any) {
    console.error("FastAPI fetch failed:", error);
    throw new Error(`Failed to communicate with backend (${API_URL}): ${error.message}`);
  }
}

export async function validateImage(image: string | null): Promise<boolean> {
  if (!image) return false;
  try {
    const response = await fetch(`${API_URL}/validate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error("FastAPI validation fetch failed:", error);
    // If backend is unreachable or fails, we might want to let them pass and fail at classify,
    // but returning false is safer. For now, let's return true so we don't hard block 
    // if the endpoint is temporarily down, or return false to strictly block.
    // The user wants strict blocking.
    return false;
  }
}
