# 🧬 BioPipeline — End-to-End Computational Drug Discovery Platform

> **An Advanced MLOps & Bioinformatics Platform** integrating algorithmic genomics, zero-shot AI 3D protein structure prediction (Meta ESMFold), dynamic programming sequence alignment, cheminformatics (Lipinski Rule of 5), and machine learning QSAR drug-activity prediction.

---

## 🌟 Overview

**BioPipeline** bridges classical bioinformatics algorithms with state-of-the-art Machine Learning (ML) and Artificial Intelligence (AI) to form an end-to-end **Computational Drug Discovery (In Silico / Rational Drug Design)** pipeline.

The platform takes raw genomic DNA input, identifies target genes, models their 3D protein structure, validates target druggability, screens thousands of small molecules against pharmacokinetic rules, and utilizes a Random Forest QSAR ML model to rank top lead drug candidates.

---

## 🔬 The 5-Stage Pipeline Architecture

```
[ Stage 1: Ingestion & Motifs ] ──► [ Stage 2: ESMFold 3D AI ] ──► [ Stage 3: NW Alignment & ML Gate ]
                                                                               │
[ Stage 5: QSAR ML Drug Ranking ] ◄── [ Stage 4: Lipinski ADME Filter ] ◄──────┘
```

### 📥 Stage 1: Data Ingestion, Suffix Trees & 6-Frame Translation
- **GC Content & Sequence Statistics**: Automatic %GC stability analysis.
- **Motif Pattern Search**: Combines **Generalized Suffix Trees** with **Regex** to locate Transcription Factor (TF) binding sites for **RUNX1**, **TGIF1**, and **IKZF1**.
- **Transcription & Translation**: Transcribes DNA to mRNA ($5' \rightarrow 3'$) and translates into amino acid chains.
- **6-Frame Translation**: Translates all 3 forward and 3 reverse-complement reading frames, detecting Open Reading Frames (ORFs $\ge 10$ AA).

### 🧬 Stage 2: Foundation Model 3D Structure Prediction (Meta ESMFold)
- **Zero-Shot AI 3D Folding**: Connects directly to the **Meta AI ESMFold v1 API** for instant 3D protein structure prediction.
- **Integrated PDB Assets**: Supports loading pre-computed PDB models from university assignment benchmarks (`6WX6_A`, `AAP36762.1`, `WP_217683847.1`).
- **Interactive 3D WebGL Viewer**: Rendered with `3Dmol.js` featuring **Ribbon Cartoon**, **Sticks**, and **CPK Spheres** modes, auto-rotation, pLDDT confidence scoring heatmap, and PDB export.

### 🛡️ Stage 3: Needleman-Wunsch Alignment & Target Validation Gate
- **Dynamic Programming Sequence Alignment**: Global **Needleman-Wunsch (NW)** algorithm with customizable Match, Mismatch, and Gap penalty parameters.
- **Multi-Target Alignment**: Aligns query protein against 4 major disease target families:
  1. *EGFR Tyrosine Kinase* (Oncology)
  2. *SARS-CoV-2 Spike S1 Domain* (Virology)
  3. *TP53 Tumor Suppressor* (Cellular Guardian)
  4. *KRAS G12D Mutant GTPase* (Pancreatic Cancer Target)
- **One-Hot ML Classification**: Logistic Regression model assessing hydrophobicity, net charge ratio, and aromatic content to calculate a **Target Validity Score (%)**. Threshold: $\ge 65\%$ unlocks Stage 4.

### 🧪 Stage 4: Cheminformatics & Lipinski Rule of 5 Filter Engine
- **ADME Pharmacokinetic Filtering**: Filters 1,000 FDA-approved small molecule compounds (SMILES dataset) against **Lipinski's Rule of Five**:
  - Molecular Weight ($\text{MW} \le 500\text{ Da}$)
  - Lipophilicity ($\text{LogP} \le 5.0$)
  - H-Bond Donors ($\text{HBD} \le 5$)
  - H-Bond Acceptors ($\text{HBA} \le 10$)
  - Topological Polar Surface Area ($\text{TPSA} \le 140\text{ \AA}^2$)
- **Interactive UI**: Real-time ADME sliders, custom SMILES CSV file upload, sample CSV template download, and candidate selection (top $\le 50$ molecules).

### 🏆 Stage 5: QSAR Machine Learning Predictive Inference & Ranking
- **Random Forest QSAR Engine**: Pre-trained ensemble model scoring candidates using **2048-bit Morgan Fingerprints** (radius=2) and target-complementarity feature vectors.
- **Predictive Metrics**:
  - Predicted $pIC_{50}$ ($-\log_{10} IC_{50}$)
  - Binding Affinity $K_i$ (nM)
  - Docking Free Energy $\Delta G$ ($\text{kcal/mol}$)
  - Drug-Likeness Score ($0 - 100\%$)
- **Data Visualizations & Export**: Interactive SVG $pIC_{50}$ distribution chart, **Top 3 Lead Candidate Podium Cards**, full predictions table, and downloadable **JSON & TXT Audit Reports**.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, TypeScript |
| **Styling & Aesthetics** | TailwindCSS 3, Lucide Icons, Glassmorphism UI |
| **3D Rendering** | WebGL, 3Dmol.js (py3Dmol equivalent) |
| **Algorithms** | Needleman-Wunsch DP, Suffix Trees, Codon Translation |
| **Machine Learning** | Logistic Regression, Random Forest QSAR Ensemble, Morgan Fingerprints |
| **APIs** | Meta AI ESMFold REST API |

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- `npm` or `yarn`

### Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/FilippeZ/bioinformatics.git
cd bioinformatics/biopipeline-app

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.

---

## 📁 Repository Structure

```
bioinformatics/
├── biopipeline-app/                 # Main React + Vite Application
│   ├── public/                      # Static assets & PDB 3D models
│   │   └── pdb/                     # 6WX6_A, AAP36762.1, WP_217683847.1 models
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Header, Sidebar, StepperBar
│   │   │   ├── landing/             # Sci-Fi Landing Page
│   │   │   ├── modules/             # Module1 - Module5 UI components
│   │   │   └── viewers/             # 3D Protein WebGL Viewer
│   │   ├── context/                 # Pipeline State Management Context
│   │   ├── lib/
│   │   │   └── algorithms/          # Alignment, DNA Parser, ESMFold API, Lipinski, QSAR
│   │   └── types/                   # TypeScript Type Definitions
│   ├── package.json
│   └── vite.config.ts
├── filess/                          # Raw assignment files & datasets
│   ├── 6WX6_A_model.pdb
│   ├── AAP36762.1_model.pdb
│   ├── WP_217683847.1_model.pdb
│   ├── binding_regions.txt
│   ├── q7.py
│   └── seq.fasta
└── README.md
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
