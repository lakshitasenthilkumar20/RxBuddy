import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np
import easyocr
import re
from rapidfuzz import fuzz, process
import json
import os
from datetime import datetime

class MedicineOCR:
    """
    Advanced Medicine Extraction Engine using TrOCR and EasyOCR.
    Integrates fuzzy matching for error correction and dosage extraction.
    """
    def __init__(self, model_path):
        print(f"🚀 Initializing OCR Engine with model from: {model_path}")
        
        # Load processor and model from the local checkpoint path
        try:
            self.processor = TrOCRProcessor.from_pretrained(model_path)
            self.model = VisionEncoderDecoderModel.from_pretrained(model_path)
        except Exception as e:
            print(f"⚠️ Error loading from local path {model_path}: {e}")
            print("🔄 Attempting to load base printed processor as fallback...")
            self.processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
            self.model = VisionEncoderDecoderModel.from_pretrained(model_path)

        self.model.eval()
        self.reader = easyocr.Reader(['en'])
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        
        # COMPREHENSIVE MEDICINE DATABASE
        self.medicine_database = self._build_medicine_database()
        
        # Flattened list for faster fuzzy matching
        self.all_medicine_names = []
        self.medicine_lookup = {}
        for med, variations in self.medicine_database.items():
            for var in variations:
                self.all_medicine_names.append(var.lower())
                self.medicine_lookup[var.lower()] = med
        
        print(f"✅ OCR Engine Ready. Loaded {len(self.medicine_database)} medicines.")

    def _build_medicine_database(self):
        """ULTIMATE medicine database with ALL possible variations"""
        return {
            # ===== ANTIBIOTICS (including common OCR errors) =====
            'AMOXICILLIN': ['amoxicillin', 'amoxil', 'amoxicilline', 'moxicillin', 'amox', 
                           'anoxicillin', 'amoxicilin', 'amoxycillin', 'amoxcillin', 'amoxicllin',
                           'amoxicilin', 'amoxcyillin', 'amoxacyllin', 'amoxicilin', 'amoxicilln',
                           'amoxicllin', 'amoxiciliin', 'amoxacillin', 'amoxacilin', 'anoxacillin'],
            
            'AZITHROMYCIN': ['azithromycin', 'azithral', 'zithromax', 'azax', 'azithromycin', 
                            'azithromicin', 'azithromyzin', 'azithromycine', 'azithromyci'],
            
            'ERYTHROMYCIN': ['erythromycin', 'erythrocin', 'erythromicin', 'erythromycine',
                            'erythromycinethylsuccinate', 'erythromycin ethylsuccinate'],
            
            'AMPHOTERICIN': ['amphotericin', 'amphotericinb', 'fungizone', 'amphocin',
                            'amphotericin b', 'amphotericine', 'amphocil'],
            
            'CEPHALEXIN': ['cephalexin', 'keflex', 'cephaxin', 'cephalexine', 'cefalexin'],
            
            'CIPROFLOXACIN': ['ciprofloxacin', 'cipro', 'ciproxin', 'ciproflox', 'ciprofloxacine'],
            
            'DOXYCYCLINE': ['doxycycline', 'doxylin', 'vibramycin', 'doxycyclin', 'doxcycycline'],
            
            'FLUCLOXACILLIN': ['flucloxacillin', 'fluocacilin', 'floxacillin', 'fluclox', 'flucoxacillin'],
            
            'METRONIDAZOLE': ['metronidazole', 'flagyl', 'metronidazol', 'metro'],
            
            'CLARITHROMYCIN': ['clarithromycin', 'biaxin', 'klaricid', 'clarithro', 'clarithromycine'],
            
            'AUGMENTIN': ['augmentin', 'aujnenturi', 'co-amoxiclav', 'co amoxiclav', 'amoxicillin clavulanate'],
            
            # ===== PAIN KILLERS =====
            'PARACETAMOL': ['paracetamol', 'acetaminophen', 'pcm', 'crocin', 'tylenol', 'dolo', 'calpol',
                           'aretaminophen', 'paracetamole', 'paracetamol', 'paracitamol', 'paracetemol','Paracetanoftab'],
            
            'IBUPROFEN': ['ibuprofen', 'brufen', 'advil', 'motrin', 'ibugesic', 'nurofen', 'iburofen',
                         'ibuprofene', 'iboprufen', 'ibuprofin', 'iprufen'],
            
            'ASPIRIN': ['aspirin', 'ecosprin', 'disprin', 'aspro', 'acetylsalicylic acid'],
            
            'TRAMADOL': ['tramadol', 'tramazac', 'ultram', 'tramadole', 'tramadol hcl'],
            
            'DIHYDROCODEINE': ['dihydrocodeine', 'dihyrocodeine', 'dihydro', 'codeine', 'df-118'],
            
            # ===== ANTI-DIABETIC =====
            'METFORMIN': ['metformin', 'glucophage', 'glycomet', 'metformina', 'meftin', 'metformine'],
            
            'GLIBENCLAMIDE': ['glibenclamide', 'glyburide', 'daonil', 'glibenclamid'],
            
            'GLICLAZIDE': ['gliclazide', 'diamicron', 'glizide', 'gliclazid'],
            
            'TOLBUTAMIDE': ['tolbutamide', 'tolbutamid', 'tolb utamide', 'orinese', 'tolbutamid'],
            
            # ===== CARDIAC DRUGS =====
            'DIGOXIN': ['digoxin', 'dijoxin', 'digoxine', 'lanoxin', 'digox'],
            
            'ATENOLOL': ['atenolol', 'tenormin', 'atenol', 'atenolole'],
            
            'AMLODIPINE': ['amlodipine', 'norvasc', 'amlogard', 'amlodipin'],
            
            'LISINOPRIL': ['lisinopril', 'zestril', 'prinivil', 'lisinoprile'],
            
            'LOSARTAN': ['losartan', 'losnian', 'cozaar', 'losartana'],
            
            'CLOPIDOGREL': ['clopidogrel', 'plavix', 'clopidogrel bisulfate'],
            
            'METOPROLOL': ['metoprolol', 'betaloc', 'lopressor', 'bet aloc', 'beta loc'],
            
            'ENALAPRIL': ['enalapril', 'vasotec', 'enalaprila'],
            
            'FUROSEMIDE': ['furosemide', 'lasix', 'frusemide'],
            
            'SPIRONOLACTONE': ['spironolactone', 'aldactone', 'spironolacton'],
            
            'WARFARIN': ['warfarin', 'coumadin', 'warfarina'],
            
            'NITROGLYCERIN': ['nitroglycerin', 'nitrostat', 'nitrovas', 'nitro', 'ntg'],
            
            # ===== STOMACH MEDICINES =====
            'OMEPRAZOLE': ['omeprazole', 'omez', 'prilosec', 'omeprole', 'omeprazol'],
            
            'PANTOPRAZOLE': ['pantoprazole', 'pantocid', 'protonix', 'pantonix', 'pantoprazol'],
            
            'LANSOPRAZOLE': ['lansoprazole', 'lomac', 'prevacid', 'lansoprazol'],
            
            'RANITIDINE': ['ranitidine', 'zantac', 'ranitidin', 'ranitidina'],
            
            'CIMETIDINE': ['cimetidine', 'tagamet', 'cinetidine', 'cehtigine', 'cimetidin'],
            
            # ===== ANTIDEPRESSANTS =====
            'AMITRIPTYLINE': ['amitriptyline', 'elavil', 'amitrip', 'amitriptylin'],
            
            'FLUOXETINE': ['fluoxetine', 'prozac', 'fluoxetina'],
            
            'SERTRALINE': ['sertraline', 'zoloft', 'sertralina'],
            
            'CITALOPRAM': ['citalopram', 'celexa', 'citalopram'],
            
            'VENLAFAXINE': ['venlafaxine', 'effor', 'venlafaxina'],
            
            # ===== ANTICONVULSANTS =====
            'GABAPENTIN': ['gabapentin', 'neurontin', 'gabapentina'],
            
            'PREGABALIN': ['pregabalin', 'lyrica', 'pregabalina'],
            
            # ===== SPECIFIC MEDICINES =====
            'EUDIBENE': ['eudibene', 'eudiben', 'eudibene de'],
            
            'DORZOLAMIDE': ['dorzolamide', 'dorzolamidum', 'trusopt', 'dorzolamid', 'dorzolanidum'],
            
            'OXPRENOLOL': ['oxprenolol', 'oxprelol', 'trasicor', 'oxprenolole'],
            
            'PANCREATOME': ['pancreatome', 'pancreatin', 'pancrelipase'],
            
            'METOCLOPRAMIDE': ['metoclopramide', 'maxolon', 'metoclopramid'],
            
            'CEFTIGINE': ['ceftigine', 'cehtigine'],
            
            'FLUOCACILIN': ['fluocacilin'],
            
            'LOSNIAN': ['losnian'],
            
            'PANTONIX': ['pantonix'],
            
            'BELLADONNA': ['belladonna', 'belladone', 'atropa belladonna', 'belladona'],
            
            'AMPHOGEL': ['amphogel', 'amphogiel', 'amophelgel', 'aluminum hydroxide gel'],
            
            'LEVOTHYROXINE': ['levothyroxine', 'synthroid', 'levothyroxin'],
            
            'HYDROCHLOROTHIAZIDE': ['hydrochlorothiazide', 'hctz', 'hydrochlorothiazid'],
            
            'PREDNISONE': ['prednisone', 'deltasone', 'prednisona'],
            
            'HEMULIN':['hrmv','Hemulin','hemulin'],
            
            'NOVORAPID':['NovORApid','Novorapid','novorapid'],
            
            'PHYMTOIN':['Phymtoin','phmuftan'],
            
            'XPQ':['Xpq','xpq','XPI'],
            
            'VITAMINC':['VITAMIN'],
            
            'MAXPRO':['Maxpro', 'masepro'],
        }


    def is_medicine(self, text):
        """Advanced medicine detection with proper fuzzy matching"""
        if not text or len(text) < 3:
            return None
        
        text_clean = re.sub(r'[^a-zA-Z]', '', text.lower())
        if len(text_clean) < 3:
            return None
        
        # METHOD 1: Direct lookup
        if text_clean in self.medicine_lookup:
            return self.medicine_lookup[text_clean].upper()
        
        # METHOD 2: Partial match
        for var, med in self.medicine_lookup.items():
            if var in text_clean or text_clean in var:
                if len(text_clean) > 4 and len(var) > 4:
                    return med.upper()
        
        # METHOD 3: Fuzzy matching
        best_match = process.extractOne(
            text_clean, 
            self.all_medicine_names,
            scorer=fuzz.ratio,
            score_cutoff=75
        )
        
        if best_match:
            matched_var = best_match[0]
            return self.medicine_lookup[matched_var].upper()
        
        # METHOD 4: Suffix-based detection
        suffixes = ['cillin', 'mycin', 'cycline', 'oxacin', 'zole', 'prazole', 
                   'tidine', 'sartan', 'dipine', 'lol', 'pril', 'statin',
                   'formin', 'gliptin', 'gliflozin', 'navir', 'vir', 'done']
        
        for suffix in suffixes:
            if text_clean.endswith(suffix) and len(text_clean) > 5:
                return text_clean.upper()
        
        return None

    def extract_dosage(self, text):
        """Extract dosage information using multiple regex patterns"""
        if not text:
            return None
        
        text_lower = text.lower()
        patterns = [
            r'(\d+\.?\d*)\s*(mg|ml|mcg|g|iu)\b',
            r'(\d+)\s*mg\/ml',
            r'(\d+)\s*mg',
            r'(\d+)\s*ml',
            r'(\d+\.?\d*)\s*g',
            r'-\s*(\d+)(mg|ml|g)',
            r'(\d+)(mg|ml|g)(?:\b|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                if len(match.groups()) == 2:
                    return f"{match.group(1)}{match.group(2)}"
                else:
                    if 'mg' in text_lower: return f"{match.group(1)}mg"
                    elif 'ml' in text_lower: return f"{match.group(1)}ml"
                    else: return f"{match.group(1)}mg"
        return None

    def enhance_dosage_reporting(self, medicines):
        """Post-process to ensure dosage is captured even if missed initially"""
        for med in medicines:
            if med['dosage'] is None and med['original']:
                text = med['original'].lower()
                patterns = [
                    r'(\d+)\s*(?:mg|ml|g|mcg|iu|unit)s?\b',
                    r'(\d+)\s*mg\/ml',
                    r'[×x]\s*(\d+)',
                    r'(\d+)\s*(?:tab|caps?|tabs|capsules?)',
                ]
                for pattern in patterns:
                    match = re.search(pattern, text)
                    if match:
                        med['dosage'] = f"{match.group(1)}mg"
                        break
        return medicines

    def process_image(self, image_path):
        """
        Full OCR pipeline:
        1. Region detection with EasyOCR
        2. Text recognition with TrOCR for each region
        3. Line grouping and data extraction
        """
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return {'medicines': [], 'details': []}

        image = Image.open(image_path).convert('RGB')
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Detect text regions
        results = self.reader.readtext(image_cv)
        
        all_predictions = []
        for bbox, easy_text, easy_conf in results:
            y_coords = [point[1] for point in bbox]
            y_center = sum(y_coords) / 4
            
            pts = np.array(bbox, dtype=np.int32)
            x, y = pts.min(axis=0)
            x2, y2 = pts.max(axis=0)
            
            # Padding
            pad = 5
            x, y = max(0, x-pad), max(0, y-pad)
            x2, y2 = min(image_cv.shape[1], x2+pad), min(image_cv.shape[0], y2+pad)
            
            region_pil = Image.fromarray(cv2.cvtColor(image_cv[y:y2, x:x2], cv2.COLOR_BGR2RGB))
            
            # TrOCR Recognition
            pixel_values = self.processor(region_pil, return_tensors="pt").pixel_values.to(self.device)
            with torch.no_grad():
                generated_ids = self.model.generate(pixel_values, max_length=50, num_beams=3)
                trocr_text = self.processor.decode(generated_ids[0], skip_special_tokens=True)
            
            all_predictions.append({
                'easyocr': easy_text,
                'trocr': trocr_text,
                'confidence': easy_conf,
                'y_center': y_center
            })

        # Sort by vertical position and group lines
        all_predictions.sort(key=lambda x: x['y_center'])
        
        medicine_dosage_map = {}
        for pred in all_predictions:
            trocr_text, easy_text = pred['trocr'], pred['easyocr']
            
            medicine_match = self.is_medicine(trocr_text) or self.is_medicine(easy_text)
            dosage = self.extract_dosage(trocr_text) or self.extract_dosage(easy_text)
            
            if medicine_match:
                medicine_dosage_map[medicine_match] = {
                    'name': medicine_match,
                    'original': trocr_text,
                    'confidence': pred['confidence'] * 100,
                    'dosage': dosage
                }
            elif dosage and medicine_dosage_map:
                last_med = list(medicine_dosage_map.keys())[-1]
                if not medicine_dosage_map[last_med]['dosage']:
                    medicine_dosage_map[last_med]['dosage'] = dosage

        medicines = self.enhance_dosage_reporting(list(medicine_dosage_map.values()))
        
        return {
            'medicines': [m['name'] for m in medicines],
            'details': medicines
        }
