# Management Commands

Django management commands directory.

## Available Commands

### create_sample_data

Creates sample study trees with nodes for testing and demonstration.

**Usage:**
```bash
# Create sample data for default user (admin)
docker compose exec django python manage.py create_sample_data

# Create for specific user
docker compose exec django python manage.py create_sample_data --username=myuser
```

**What it creates:**
- "Machine Learning Fundamentals" tree with:
  - Neural Networks (with CNNs, RNNs, Transformers)
  - Supervised Learning (with Linear Regression, Decision Trees, Random Forests)
  - Unsupervised Learning (with K-Means, PCA)
- "Web Development Stack" tree with Frontend/Backend nodes

This is useful for:
- Testing the UI
- Demonstrating features
- Development without manually creating data
