# ML Plan: Padi Module-Level Readiness Classifier

> **Model name:** `padi-readiness-classifier`
> **Date:** 2026-03-04
> **Owner:** Nisha Iyer / Padi Engineering
> **Status:** Planning

---

## 1. Problem Framing

### What This Model Does

At the **module level**, a parent (or teacher) records the child performing the module activities and writes observational notes. This model ingests both inputs and classifies the child into one of three readiness buckets:

| Bucket | Label | Meaning |
|--------|-------|---------|
| 1 | **Ready for 1st Grade** | Child demonstrates mastery of the module's skills |
| 2 | **Needs More Intervention** | Child is progressing but needs continued practice |
| 3 | **Needs SIS / Deep Breath Therapy** | Child shows signs of significant struggle requiring specialized support |

### Inputs and Outputs

```
INPUTS (per student, per module):
  ├── audio_recording: .wav/.m4a file of the child performing the module
  ├── parent_notes: free-text handwritten notes (transcribed via OCR or typed)
  ├── module_metadata: module code, chapter, group, objective
  └── student_metadata: student id, prior module scores (optional)

OUTPUT:
  ├── classification: one of ["ready", "intervention", "sis_therapy"]
  ├── confidence: float 0.0–1.0
  └── reasoning: short explanation of key signals (for parent/teacher transparency)
```

### Task Type

- **Supervised multi-class classification** (3 classes)
- **Multimodal**: audio + text + structured metadata
- **Per-module granularity**: one prediction per (student, module) pair

### Success Criteria

| Metric | Business Term | ML Term | Target |
|--------|--------------|---------|--------|
| Accuracy | % of children correctly bucketed | Overall accuracy | ≥ 85% |
| Safety recall | Children needing SIS never classified "ready" | Recall on class 3 (SIS) | ≥ 95% |
| Teacher agreement | Model matches teacher judgment | Cohen's kappa vs. expert labels | ≥ 0.75 |
| Latency | Result appears within seconds of upload | p95 inference latency | < 5 seconds |

**Critical constraint:** False negatives on the SIS/therapy class are the most dangerous error. A child who needs support must never be told they're "ready." The model should be biased toward caution — over-referring is safer than under-referring.

---

## 2. Data Plan

### 2.1 What Data You Need to Collect from Padi

You need a new table to store ML-ready assessment data. This replaces the existing simple `module_assessments` notes-only table with a full ML-ready version:

```sql
-- New table: module-level readiness assessments
-- Curriculum hierarchy (post KAN-61): Chapter → Group → Module (no phase layer)
-- module_detail_id links directly to content.module_detail
CREATE TABLE module_assessment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  module_detail_id UUID NOT NULL REFERENCES module_detail(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id),

  -- Audio input
  audio_url TEXT,                    -- Supabase Storage URL for the recording
  audio_duration_sec FLOAT,         -- length of recording
  audio_format TEXT,                 -- 'wav', 'm4a', 'webm'

  -- Text input
  parent_notes TEXT,                 -- typed or OCR'd handwritten notes
  notes_source TEXT DEFAULT 'typed', -- 'typed', 'ocr', 'photo'
  notes_photo_url TEXT,              -- original handwritten note image (if applicable)

  -- ML prediction (written by classifier service)
  model_prediction TEXT,
  model_confidence FLOAT,
  model_version TEXT,
  model_reasoning TEXT,

  -- Teacher feedback (written by teacher confirmation UI)
  readiness_label TEXT,              -- 'ready', 'intervention', 'sis_therapy'
  labeled_by UUID REFERENCES profiles(id),
  labeled_at TIMESTAMPTZ,
  teacher_agrees BOOLEAN,
  teacher_correction TEXT,
  feedback_at TIMESTAMPTZ,

  -- Metadata
  context JSONB DEFAULT '{}',        -- device, session info, app version
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_assessment_student ON module_assessment(student_id, created_at);
CREATE INDEX idx_assessment_module ON module_assessment(module_detail_id, created_at);
CREATE INDEX idx_assessment_label ON module_assessment(readiness_label) WHERE readiness_label IS NOT NULL;
CREATE INDEX idx_assessment_tenant ON module_assessment(tenant_id);

-- RLS: tenant-scoped
ALTER TABLE module_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON module_assessment
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

### 2.2 Data Collection Instrumentation

In the Padi app, when a parent completes a module recording session:

1. **Audio**: Upload the recording to Supabase Storage (`audio-recordings` bucket), store the URL
2. **Notes**: If typed, store directly. If handwritten photo, run OCR (Google Vision API or Tesseract) and store both the image URL and extracted text
3. **Module context**: Join `module_detail` → `module_group` → `curriculum_chapter` to attach curriculum metadata
4. **Student context**: Attach student ID and any prior assessment results

### 2.3 Public Datasets for Pretraining / Transfer Learning

These won't train your classifier directly, but they provide pretrained model weights that your system builds on:

| Dataset | What It Gives You | Size | Source |
|---------|------------------|------|--------|
| **LibriSpeech** | Pretrained speech recognition (Whisper uses this) | 1,000h audio | openslr.org/12 |
| **Common Voice** | Child/accented speech diversity | 19K+ hours | commonvoice.mozilla.org |
| **CMU Kids Corpus** | Children's speech specifically | 76 children | ldc.upenn.edu |
| **MyST (My Science Tutor)** | Children reading aloud with annotations | 393 children, 230h | openslr.org/152 |
| **ORF Benchmarks (Acadience)** | Oral reading fluency norms by grade | National norms | acadience.org |
| **Dolch Word List** | Sight words expected for K readiness | 315 words | Various |

### 2.4 Labeling Strategy

**Who labels:** Certified K reading specialists or experienced Padi teachers. Not parents — parents provide the raw input, experts provide the label.

**Labeling process:**

1. Expert listens to the audio recording
2. Expert reads the parent notes
3. Expert sees the module objective (what the child was supposed to demonstrate)
4. Expert assigns one of the three labels with a short rationale

**Tool:** [Label Studio](https://labelstud.io/) (free, self-hosted) with a custom interface showing:
- Audio player for the recording
- Text field showing parent notes
- Module objective display
- 3-button classification selector + free-text rationale field

**Quality assurance:**
- Require **2 independent labelers** per assessment for the first 500 samples
- Target Cohen's kappa > 0.80 between labelers
- Create a detailed labeling guide with example audio clips for each class
- Hold weekly calibration sessions with labelers

### 2.5 Minimum Data Volumes

| Phase | Samples Needed | Timeline |
|-------|---------------|----------|
| **Proof of concept** | 200 labeled assessments (balanced across 3 classes) | Month 1–2 |
| **Minimum viable model** | 500–1,000 labeled assessments | Month 3–4 |
| **Production-grade** | 2,000–5,000 labeled assessments | Month 6–12 |
| **High confidence** | 10,000+ labeled assessments | Year 2+ |

**Cold start strategy:** Until you have 200+ labeled samples, use a **prompt-based approach** with an LLM (see Baseline Model below). This gets you a working system on day 1 that improves as data accumulates.

---

## 3. Model Architecture

### Architecture Overview

This is a **multimodal classification** problem. The audio and text need to be processed into features, then combined for classification.

```
                    ┌─────────────────┐
                    │ Audio Recording  │
                    └────────┬────────┘
                             │ Whisper
                             ▼
                    ┌─────────────────┐
                    │ Audio Transcript │
                    │ + Fluency Feats  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Parent Notes  │   │  Transcript  │   │ Module Metadata   │
│   (text)      │   │   (text)     │   │ (phase, domain,   │
│               │   │              │   │  objective)        │
└──────┬───────┘   └──────┬───────┘   └────────┬──────────┘
       │                  │                     │
       └──────────────────┼─────────────────────┘
                          │  Combined prompt / features
                          ▼
                 ┌──────────────────┐
                 │  Classifier       │
                 │  (LLM or ML)      │
                 └────────┬─────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │ ready | intervention │
              │      | sis_therapy   │
              └──────────────────────┘
```

### 3A. Baseline Model — LLM Prompt Classifier (Start Here)

**Use this from Day 1.** No training data required. Gets you a working system immediately.

**How it works:**
1. Run audio through **OpenAI Whisper** (or `whisper.cpp`) → transcript + word timestamps
2. Extract **fluency features** from Whisper output: words per minute, pause count, hesitation count, word error patterns
3. Combine transcript + fluency features + parent notes + module objective into a **structured prompt**
4. Send to **Claude Sonnet** (or GPT-4o) with a classification prompt
5. Parse the structured response

**Example prompt:**
```
You are an expert K-level reading specialist assessing a child's readiness
based on a module observation.

MODULE: {module.title}
CHAPTER: {chapter.title}
GROUP: {group.title}
OBJECTIVE: {module.objective}

AUDIO TRANSCRIPT OF CHILD:
{whisper_transcript}

FLUENCY METRICS:
- Words per minute: {wpm}
- Pause count (>2s): {pause_count}
- Self-corrections: {self_corrections}
- Audio duration: {duration_sec}s

PARENT/TEACHER NOTES:
{parent_notes}

Based on this evidence, classify the child into exactly one category:

1. READY — Child demonstrates mastery of this module's objectives
2. INTERVENTION — Child is progressing but needs more practice
3. SIS_THERAPY — Child shows significant struggle, may need specialized support

Respond in JSON:
{
  "classification": "ready" | "intervention" | "sis_therapy",
  "confidence": 0.0-1.0,
  "reasoning": "2-3 sentence explanation",
  "key_signals": ["signal1", "signal2"]
}
```

| Aspect | Detail |
|--------|--------|
| **Cost** | ~$0.01–0.03 per assessment (Claude Sonnet) |
| **Latency** | 2–4 seconds |
| **Accuracy** | Estimated 70–80% (before any fine-tuning) |
| **Data needed** | 0 labeled samples |
| **When to use** | Day 1 through ~500 labeled samples |

### 3B. Production Model — Fine-Tuned Classifier

Once you have 500+ labeled assessments, train a dedicated model:

**Option A: Fine-tuned LLM (Recommended for < 5K samples)**

Fine-tune **Mistral 7B** or **Llama 3.1 8B** with LoRA on your labeled data. Input is the same structured prompt; output is the classification JSON.

```python
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.3")
lora_config = LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    task_type="CAUSAL_LM"
)
model = get_peft_model(base_model, lora_config)
# Trainable params: ~0.1% of 7B = ~7M parameters
```

**Option B: Feature-Based Classifier (Recommended for 5K+ samples)**

Extract features from both modalities, concatenate, and classify with XGBoost or a small neural network:

```
Audio features (from Whisper + librosa):
  - words_per_minute, total_words, total_duration
  - pause_count, avg_pause_duration, longest_pause
  - self_correction_count, repetition_count
  - pitch_mean, pitch_variance (child stress indicators)
  - energy_mean, energy_variance

Text features (from parent notes, via sentence-transformers):
  - 384-dim embedding of parent notes (all-MiniLM-L6-v2)
  - sentiment score
  - keyword presence: ["struggling", "improving", "fluent", "hesitant", ...]

Module features:
  - chapter_code (ordinal), group_code (one-hot), difficulty_level

→ Concatenated feature vector (~400 dims)
→ XGBoost with class_weight={0: 1, 1: 1, 2: 3}  (upweight SIS class)
```

### Architecture Comparison

| Aspect | Baseline (LLM Prompt) | Fine-Tuned LLM | Feature-Based XGBoost |
|--------|----------------------|-----------------|----------------------|
| **Data needed** | 0 | 500–2K | 2K–5K |
| **Accuracy (est.)** | 70–80% | 82–90% | 85–92% |
| **Latency** | 2–4s | 1–3s | < 200ms |
| **Cost per prediction** | $0.01–0.03 | $0.001 (self-hosted) | $0.0001 |
| **Interpretability** | High (reasoning text) | Medium | Medium (SHAP values) |
| **GPU required** | No (API) | Yes (inference) | No |
| **Maintenance** | Low | Medium | Medium |
| **Best when** | Starting out, < 500 samples | 500–5K samples, need reasoning | 5K+ samples, need speed |

**Recommendation:** Start with the LLM prompt baseline. Every prediction it makes becomes a candidate for expert labeling. Once you hit 500 labeled samples, fine-tune. Once you hit 5K, evaluate whether the feature-based approach outperforms.

---

## 4. Evaluation Strategy

### Primary Metrics

| Metric | Why | Target |
|--------|-----|--------|
| **Macro F1** | Balanced performance across all 3 classes | ≥ 0.82 |
| **Recall on SIS class** | Children needing therapy must be caught | ≥ 0.95 |
| **Cohen's kappa** | Agreement with expert labelers | ≥ 0.75 |

### Secondary Metrics

| Metric | Why |
|--------|-----|
| Precision on "ready" class | Avoid prematurely advancing children |
| Confusion between "intervention" and "SIS" | Acceptable to confuse these (both get more support) |
| Per-chapter accuracy | Model should work across all curriculum chapters |
| Per-group accuracy | Check letter-knowledge vs. phonemic-awareness vs. comprehension modules |

### Test Set Design

- **Split by student** (not by assessment): prevent leakage from seeing the same child in train and test
- **Stratify by label**: ensure all 3 classes represented proportionally in each split
- **Stratify by chapter**: ensure each curriculum chapter is represented
- **70/15/15 split** for train/validation/test
- For < 1K samples, use **5-fold cross-validation** stratified by student

### Error Analysis Plan

1. **Confusion matrix**: Focus on the "SIS → ready" cell (most dangerous error)
2. **Slice analysis**: Break down accuracy by chapter, group, audio duration, notes length
3. **Failure case review**: Manually review all SIS misclassifications — categorize as label noise, ambiguous, or model error
4. **Fairness audit**: Check if accuracy varies by student demographics if available

### Bias & Fairness

This is a **high-stakes educational classification**. Audit for:
- Dialect/accent bias in audio processing (Whisper has known performance gaps for non-standard English)
- Notes length bias (parents who write less may get different classifications)
- Gender or age bias in classification rates

Use `fairlearn` to compute per-group metrics once demographic data is available.

---

## 5. Deployment Plan

### Architecture: Standalone FastAPI Service

The readiness classifier runs as its own Docker container, called by the Padi Next.js app via API routes.

```
┌──────────────────────┐      ┌──────────────────────────┐
│  Padi Next.js App     │      │ Readiness Classifier      │
│                       │      │ (FastAPI + Docker)         │
│  Parent records audio │      │                            │
│  Parent writes notes  │─────▶│ POST /assess               │
│                       │      │   ├── Whisper transcription │
│  Displays result      │◀─────│   ├── Feature extraction   │
│                       │      │   └── Classification        │
└──────────┬───────────┘      └──────────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Supabase             │
│  ├── Audio Storage    │
│  ├── module_assessment│
│  └── ml_predictions   │
└──────────────────────┘
```

### FastAPI Service Structure

```
padi-readiness-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app with /assess endpoint
│   ├── audio_processor.py   # Whisper transcription + fluency extraction
│   ├── text_processor.py    # Notes embedding + feature extraction
│   ├── classifier.py        # Model loading + inference (prompt or trained)
│   ├── schemas.py           # Request/response Pydantic models
│   └── config.py            # Environment config
├── models/                  # Saved model artifacts (mounted volume)
├── prompts/
│   └── readiness_prompt.txt # Classification prompt template
├── tests/
│   ├── test_api.py
│   ├── test_audio.py
│   └── test_classifier.py
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

### Key Endpoint

```python
# app/schemas.py
from pydantic import BaseModel
from typing import Optional

class AssessmentRequest(BaseModel):
    audio_url: str                    # Supabase Storage URL
    parent_notes: str                 # Transcribed or typed notes
    module_code: str                  # e.g., "P1-L2-M3"
    module_objective: str             # What the child should demonstrate
    chapter_title: str
    group_title: str
    student_id: str
    prior_scores: Optional[list] = None  # Previous module classifications

class AssessmentResponse(BaseModel):
    classification: str               # "ready", "intervention", "sis_therapy"
    confidence: float
    reasoning: str
    key_signals: list[str]
    transcript: str                   # Whisper output (useful for parent review)
    fluency_metrics: dict             # WPM, pause count, etc.
    model_version: str
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### requirements.txt

```
fastapi==0.109.0
uvicorn==0.27.0
openai-whisper==20231117
librosa==0.10.1
sentence-transformers==2.3.1
anthropic==0.18.0
pydantic==2.6.0
python-multipart==0.0.6
httpx==0.27.0
numpy==1.26.3
scikit-learn==1.4.0
```

### Next.js Integration (Padi App)

```typescript
// app/api/assess/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

const CLASSIFIER_URL = process.env.READINESS_CLASSIFIER_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { audio_url, parent_notes, module_detail_id, student_id } = body

  // Fetch module context from Supabase
  const supabase = createClient()
  const { data: module } = await supabase
    .from('module_detail')
    .select('code, title, summary, group:group_id(title, code, chapter:chapter_id(title, code))')
    .eq('id', module_detail_id)
    .single()

  // Call the classifier service
  const response = await fetch(`${CLASSIFIER_URL}/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_url,
      parent_notes,
      module_code: module.code,
      module_objective: module.summary,
      chapter_title: module.group.chapter.title,
      group_title: module.group.title,
      student_id,
    }),
  })

  const result = await response.json()

  // Store the prediction in Supabase for the feedback loop
  await supabase.from('module_assessment').insert({
    student_id,
    module_detail_id,
    audio_url,
    parent_notes,
    readiness_label: null,  // expert fills this later
    context: {
      prediction: result.classification,
      confidence: result.confidence,
      model_version: result.model_version,
    },
  })

  return NextResponse.json(result)
}
```

### Deployment Target

For the MVP, deploy to **Google Cloud Run** (serverless, scales to zero, no GPU needed for the prompt-based baseline):

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/padi-readiness
gcloud run deploy padi-readiness \
  --image gcr.io/$PROJECT_ID/padi-readiness \
  --port 8000 --memory 4Gi --cpu 2 \
  --set-env-vars "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY" \
  --allow-unauthenticated
```

When you move to the fine-tuned model (needs GPU), switch to **Modal** for serverless GPU:

```python
import modal
app = modal.App("padi-readiness")
image = modal.Image.debian_slim().pip_install("torch", "transformers", "peft", "whisper")

@app.function(gpu="T4", image=image)
def assess(audio_url: str, notes: str, module_context: dict) -> dict:
    # Load model, run inference
    ...
```

---

## 6. Scaling Considerations

### Phase 1: MVP (0–1K users)

- **No GPU needed** — LLM API calls handle classification
- **Cloud Run** with 4Gi memory, 2 CPU, auto-scales 0–5 instances
- **Cost**: ~$0.02 per assessment (Whisper API + Claude Sonnet)
- **Estimated monthly cost at 1K assessments/month**: ~$20

### Phase 2: Growth (1K–10K users)

- **Whisper locally** in the container (saves API costs)
- **Cache Whisper model** in Cloud Run container for warm starts
- **ONNX quantization** on feature-based model if using XGBoost path
- **Estimated monthly cost at 10K assessments/month**: ~$50–100

### Phase 3: Scale (10K+ users)

- **Fine-tuned model** on Modal with T4 GPU ($0.53/hr, scales to zero)
- **Redis caching** for repeated module assessments (same audio = same transcript)
- **Batch processing** for end-of-week report generation
- **INT8 quantization** on fine-tuned Mistral reduces T4 memory usage by 4x
- **Estimated monthly cost at 100K assessments/month**: ~$200–500

### Optimization Techniques

| Technique | When | Impact |
|-----------|------|--------|
| Run Whisper locally instead of API | Phase 2 | ~60% cost reduction on audio processing |
| Cache Whisper transcripts in Supabase | Phase 1 | Avoid re-transcribing same audio |
| ONNX export of XGBoost | Phase 2 | 2–5x faster inference, no GPU needed |
| INT8 quantization of fine-tuned LLM | Phase 3 | 4x smaller model, 2–4x faster inference |
| Batch overnight assessments | Phase 2 | Lower cost via batch API pricing |

---

## 7. Continuous Learning

### The Padi Data Flywheel

```
Parent records child on module
         │
         ▼
Model predicts: ready / intervention / sis_therapy
         │
         ▼
Teacher/specialist reviews prediction ──── agrees? ───▶ auto-label ✓
         │                                                    │
         │ disagrees?                                         │
         ▼                                                    │
Teacher provides correct label ──────────────────────────────▶│
         │                                                    │
         ▼                                                    ▼
┌────────────────────┐                             ┌─────────────────┐
│ Labeled dataset     │                             │ Labeled dataset  │
│ grows organically   │────── threshold met? ──────▶│ Retrain model    │
└────────────────────┘                             └─────────────────┘
```

### Feedback Collection

**In the Padi app**, after the model shows its classification:

1. **Teacher confirmation UI**: "Do you agree with this assessment?" → Yes / No
2. If No → "What is the correct classification?" → dropdown with 3 options + optional notes
3. Store both the model prediction and the teacher correction

These feedback columns are already included in the `module_assessment` table definition (see Section 2.1):
- `model_prediction`, `model_confidence`, `model_version`, `model_reasoning` — written by classifier
- `teacher_agrees`, `teacher_correction`, `feedback_at` — written by teacher confirmation UI
- `readiness_label`, `labeled_by`, `labeled_at` — the ground truth label

### Retraining Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Volume** | 200 new labeled samples since last training | Queue retraining job |
| **Accuracy drop** | Rolling 50-sample accuracy drops below 80% | Alert + urgent retrain |
| **Drift** | PSI > 0.15 on audio feature distributions | Investigate + retrain |
| **Scheduled** | Monthly | Retrain with all accumulated data |
| **New chapter** | New curriculum chapter added to Padi | Collect 50 samples, then retrain |

### Drift Monitoring

Monitor these signals weekly:

- **Audio duration distribution** — are recordings getting shorter/longer?
- **Notes length distribution** — are parents writing more or less?
- **Prediction distribution** — is the model classifying more children as "ready" over time?
- **Teacher disagreement rate** — is the correction rate increasing?
- **Per-chapter accuracy** — does the model degrade on newer chapters?

### Model Registry

Track every model version in Supabase:

```sql
CREATE TABLE ml_model_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL DEFAULT 'padi-readiness',
  version TEXT NOT NULL,
  model_type TEXT NOT NULL,           -- 'prompt_baseline', 'finetuned_llm', 'xgboost'
  status TEXT DEFAULT 'staging',      -- 'staging', 'production', 'retired'
  metrics JSONB NOT NULL,             -- {"macro_f1": 0.85, "sis_recall": 0.96, ...}
  training_samples INT,
  artifact_path TEXT,                 -- GCS/S3 path to model artifacts
  prompt_version TEXT,                -- version of prompt template (for baseline)
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(model_name, version)
);
```

---

## 8. Implementation Roadmap

### Month 1–2: Prompt-Based MVP

- [ ] Add `module_assessment` table to Supabase schema
- [ ] Build audio upload flow in Padi app (record → Supabase Storage)
- [ ] Build parent notes input (typed + photo OCR)
- [ ] Stand up FastAPI service with Whisper + Claude Sonnet prompt classifier
- [ ] Deploy to Cloud Run
- [ ] Wire up Next.js API route → classifier → Supabase
- [ ] Build results display UI in Padi app
- [ ] Begin expert labeling of the first 200 assessments

### Month 3–4: Validation & Feedback Loop

- [ ] Evaluate prompt baseline against 200 expert labels
- [ ] Tune the classification prompt based on error analysis
- [ ] Build teacher confirmation UI (agree/disagree + correction)
- [ ] Implement feedback storage pipeline
- [ ] Set up Label Studio for batch labeling sessions
- [ ] Reach 500 labeled assessments

### Month 5–6: First Trained Model

- [ ] Fine-tune Mistral 7B with LoRA on 500+ labeled assessments
- [ ] Evaluate against prompt baseline (must beat by ≥ 3% macro F1)
- [ ] Deploy fine-tuned model to Modal (GPU serverless)
- [ ] Run in shadow mode alongside prompt baseline for 2 weeks
- [ ] Promote if metrics hold
- [ ] Set up drift monitoring dashboard

### Month 7–12: Production Hardening

- [ ] Reach 2,000+ labeled assessments
- [ ] Evaluate feature-based XGBoost approach vs. fine-tuned LLM
- [ ] Implement automated retraining pipeline
- [ ] Add per-student longitudinal tracking (progress across modules)
- [ ] Implement A/B model comparison in production
- [ ] Quarterly bias/fairness audits

---

## 9. Key Decisions Summary

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Start with prompt or trained model?** | Prompt-based (Claude Sonnet) | Zero data required, working system day 1 |
| **Audio processing** | OpenAI Whisper (large-v3) | Best speech-to-text for children's speech |
| **Notes OCR** | Google Cloud Vision API | High accuracy on handwriting, low cost |
| **Classification approach** | Multimodal text classification (transcript + notes + metadata) | Audio becomes text via Whisper; everything is text |
| **Deployment** | FastAPI on Cloud Run (MVP), Modal (GPU phase) | Serverless, scales to zero, low ops burden |
| **Database** | Extend Supabase (module_assessment table) | Consistent with Padi stack |
| **Labeling tool** | Label Studio (self-hosted) | Free, customizable interface for audio + text |
| **Experiment tracking** | Weights & Biases (free tier) | Best-in-class for ML experiments |
| **When to train first model** | After 500 labeled assessments | Minimum viable for fine-tuning with LoRA |

---

*This plan was generated by the Padi ML Engineering Specialist. Review with the team and adjust timelines based on expert labeler availability and assessment volume.*
