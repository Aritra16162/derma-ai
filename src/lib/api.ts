import { SurveyData, TriageStatus } from '@/store/useStore';
import { API_URL } from '@/lib/config';

export async function submitToTriage(
  image: string | null,
  survey: SurveyData
): Promise<{ status: TriageStatus; conditionName?: string }> {
  // Try calling the FastAPI (via proxy)
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
    
    if (response.ok) {
      const data = await response.json();
      return { status: data.danger_level || 'Routine', conditionName: data.predicted_class };
    }
  } catch (error) {
    console.error("FastAPI unreachable, falling back to mock response", error);
  }

  // MOCK FALLBACK for demo purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      // randomly pick a status
      const statuses: TriageStatus[] = ['Routine', 'See Doctor', 'Seek Care Today'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      resolve({ status: randomStatus, conditionName: 'Contact Dermatitis' });
    }, 2000);
  });
}
