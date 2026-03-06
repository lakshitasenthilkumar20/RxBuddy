# 🏥 Medical Prescription OCR System

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)](https://pytorch.org/)
[![Transformers](https://img.shields.io/badge/🤗-Transformers-yellow.svg)](https://huggingface.co/docs/transformers/index)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 📋 Project Overview

An end-to-end OCR system for extracting medicine names and dosages from handwritten medical prescriptions. The system combines **TrOCR** (Transformer-based OCR) with **EasyOCR** and intelligent fuzzy matching to achieve ~85% accuracy on real-world prescription images.

### Key Features

- ✅ Extracts medicine names and dosages from handwritten prescriptions
- ✅ Handles various prescription formats and handwriting styles
- ✅ Fuzzy matching for OCR error correction (70+ medicine database)
- ✅ JSON output format for easy backend integration
- ✅ Confidence scores for each extraction
- ✅ Batch processing capability
- ✅ GPU acceleration support

### Component Breakdown

| Component         | Technology         | Purpose                              |
| ----------------- | ------------------ | ------------------------------------ |
| Region Detection  | EasyOCR            | Identifies text areas in the image   |
| Text Recognition  | TrOCR (Fine-tuned) | Reads text from detected regions     |
| Medicine Database | Custom dictionary  | 70+ common medicines with variations |
| Fuzzy Matching    | RapidFuzz          | Corrects OCR errors and typos        |
| Dosage Extraction | Regex patterns     | Extracts mg/ml/g values              |
| Output Formatting | JSON               | Structured data for backend          |

## 📊 Performance Metrics

| Metric                      | Value                  |
| --------------------------- | ---------------------- |
| Medicine Detection Accuracy | ~85%                   |
| Dosage Extraction Accuracy  | ~80%                   |
| Average Processing Time     | 2-5 seconds/image      |
| Test Set Size               | 50+ real prescriptions |
| Model CER                   | 0.34 on test set       |

### Sample Results

| Image  | Medicine Found         | Dosage       | Confidence  |
| ------ | ---------------------- | ------------ | ----------- |
| 1.jpg  | DIGOXIN                | 125mg        | 95.5%       |
| 10.jpg | BELLADONNA, AMPHOGEL   | Not detected | 99.9%       |
| 15.jpg | AMOXICILLIN            | 5ml          | 100%        |
| 16.jpg | PARACETAMOL, IBUPROFEN | 50mg, 150mg  | 100%, 73.9% |
| 17.jpg | LOSARTAN               | Not detected | 99.4%       |

## 💻 Installation

### Prerequisites

- Python 3.8 or higher
- CUDA-capable GPU (optional, for faster processing)
- 8GB+ RAM recommended
- 2GB free disk space

### Step-by-Step Installation

```bash
# 1. Clone or extract the project
# (You should have received a ZIP file with this structure)

# 2. Open terminal/command prompt in project folder
cd medical-prescription-ocr

# 3. Create virtual environment (recommended)
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install torch transformers easyocr opencv-python Pillow rapidfuzz numpy

# 5. Verify installation
python -c "import torch; import transformers; import easyocr; print('✅ All packages installed successfully!')"
```
