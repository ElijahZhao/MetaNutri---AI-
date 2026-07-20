# MetaNutri - AI-Powered Precision Nutrition Metabolic Digital Twin Platform

![MetaNutri Architecture](https://github.com/ElijahZhao/MetaNutri---AI-/assets/...)

## 🎯 Project Overview

MetaNutri is an AI-driven precision nutrition metabolic digital twin platform that:
- **Integrates multi-omics data** (genomics, microbiome, metabolomics)
- **Predicts individual metabolic responses** to specific foods using deep learning
- **Provides personalized nutrition intervention recommendations**

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.x |
| UI Framework | Tailwind CSS | 3.x |
| Data Visualization | ECharts | latest |
| Backend | FastAPI | 0.115.x |
| Database | SQLite / PostgreSQL | latest |
| Cache | Redis | 7.x |
| Machine Learning | PyTorch | 2.x |
| Data Processing | Pandas + NumPy | latest |

## 📁 Project Structure

```
metanutri/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── core/               # Configuration & security
│   │   ├── db/                 # Database connections
│   │   ├── ml/                 # AI models
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic
│   ├── data/                   # Reference datasets
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/                # Pages & routes
│   │   ├── components/         # React components
│   │   └── lib/                # API client & utilities
│   └── package.json            # Node dependencies
│
├── docker-compose.yml          # Container orchestration
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

### Running with Docker (Recommended)
```bash
git clone https://github.com/ElijahZhao/MetaNutri---AI-.git
cd metanutri
docker-compose up --build
```

### Running Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Key Features

### Multi-Omics Data Integration
- **Genomics Module**: SNP analysis, gene-nutrition interaction mapping
- **Microbiome Module**: α/β diversity analysis, PCoA, PERMANOVA
- **Metabolomics Module**: Metabolite profiling, pathway enrichment

### AI Prediction Models
- **Metabolic Response Transformer**: Multi-modal feature fusion for glucose/insulin prediction
- **Gene-Nutrition GNN**: Graph neural network for gene-nutrition-metabolic pathway modeling
- **Microbiome VAE**: Variational autoencoder for microbiome optimization

### Data Visualization
- Metabolic pathway visualization (glycolysis, TCA cycle, fatty acid oxidation)
- Microbiome health radar charts
- Diet-microbiome association heatmaps
- Nutrition radar charts

### Recommendation System
- Personalized food scoring
- Meal plan generation
- Nutrient deficiency alerts
- Dietary suggestions based on genetic profile

### System Features
- JWT authentication
- RBAC permission system
- Data import/export (CSV, JSON)
- Redis caching
- Model explainability (SHAP/LIME)

## 🌐 API Documentation

Once running, access the API docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📊 Datasets Used

| Dataset | Source | Purpose |
|---------|--------|---------|
| USDA FoodData Central | USDA | Food nutrition database |
| KEGG Pathways | KEGG | Metabolic pathway mapping |
| HMP Reference | NIH | Microbiome reference data |
| NHANES | CDC | Health survey data |
| PREDICT | King's College London | Metabolic response research |

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For questions or collaboration, please reach out via GitHub issues.

---

**Built with ❤️ for precision nutrition research**