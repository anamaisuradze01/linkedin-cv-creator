import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, title, skills, experience, style = "minimal" } = await req.json();
    
    console.log("Generating CV for:", name, "with title:", title);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt - same as your generate_pdf.py
    const prompt = `You are an expert CV/Resume writer. Your task is to generate a highly professional, concise, and impactful CV summary (also known as a Professional Profile or Personal Statement) for a job application.

### Input Data
* *Name:* ${name}
* *Target Job Title:* ${title}
* *Key Skills:* ${skills.join(', ')}
* *Relevant Experience (Achievements/Responsibilities):* ${experience.join(', ')}
* *Desired Tone/Style:* ${style} (e.g., formal, creative, dynamic, results-oriented)

### Instructions
1.  *Length:* The summary must be *3 to 5 sentences* long.
2.  *Focus:* The summary must be tailored specifically to the *Target Job Title* (${title}).
3.  *Content:*
    * *Sentence 1:* State the person's current/target role and *quantify* their experience level (e.g., "Highly motivated 7-year veteran...").
    * *Middle Sentences:* Highlight 1-2 most significant *achievements* or *core responsibilities* from the *Experience* list.
    * *Closing Sentence:* Conclude with the most relevant *skills* and a clear statement of their *value proposition* or career goal.
4.  *Style:* Strictly adhere to the *Desired Tone/Style* (${style}).

Please generate the Professional Summary only, without any headings or introductory text.`;

    console.log("Calling Lovable AI Gateway with Gemini model...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert CV/Resume writer who creates professional, impactful content." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          success: false 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please add credits to continue.",
          success: false 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summaryText = data.choices?.[0]?.message?.content || "";
    
    console.log("Generated summary successfully");

    return new Response(JSON.stringify({ 
      success: true,
      summary: summaryText,
      name,
      title,
      skills,
      experience
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-cv function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
