"""
Django management command to create sample data for testing.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Tree, TreeMember, Node


class Command(BaseCommand):
    help = 'Create sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username of the user to create data for',
        )

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" not found. Please create a user first.'))
            return

        # Create a sample tree
        tree, created = Tree.objects.get_or_create(
            owner=user,
            title='Machine Learning Fundamentals',
            defaults={
                'visibility': 'private'
            }
        )

        if created:
            # Create owner membership
            TreeMember.objects.create(
                tree=tree,
                user=user,
                role='owner'
            )
            self.stdout.write(self.style.SUCCESS(f'Created tree: {tree.title}'))

            # Create root nodes
            neural_networks = Node.objects.create(
                tree=tree,
                title='Neural Networks',
                user_notes='Deep learning fundamentals using artificial neural networks.',
                created_by=user,
                sibling_order=1
            )

            supervised_learning = Node.objects.create(
                tree=tree,
                title='Supervised Learning',
                user_notes='Learning from labeled data to make predictions.',
                created_by=user,
                sibling_order=2
            )

            unsupervised_learning = Node.objects.create(
                tree=tree,
                title='Unsupervised Learning',
                user_notes='Finding patterns in unlabeled data.',
                created_by=user,
                sibling_order=3
            )

            # Create child nodes for Neural Networks
            Node.objects.create(
                tree=tree,
                parent=neural_networks,
                title='Convolutional Neural Networks (CNNs)',
                user_notes='Specialized for processing grid-like data such as images.',
                created_by=user,
                sibling_order=1
            )

            Node.objects.create(
                tree=tree,
                parent=neural_networks,
                title='Recurrent Neural Networks (RNNs)',
                user_notes='Designed for sequential data like time series or text.',
                created_by=user,
                sibling_order=2
            )

            Node.objects.create(
                tree=tree,
                parent=neural_networks,
                title='Transformers',
                user_notes='Attention-based architecture revolutionizing NLP.',
                created_by=user,
                sibling_order=3
            )

            # Create child nodes for Supervised Learning
            Node.objects.create(
                tree=tree,
                parent=supervised_learning,
                title='Linear Regression',
                user_notes='Predicting continuous values using a linear relationship.',
                created_by=user,
                sibling_order=1
            )

            Node.objects.create(
                tree=tree,
                parent=supervised_learning,
                title='Decision Trees',
                user_notes='Tree-like model of decisions and their possible consequences.',
                created_by=user,
                sibling_order=2
            )

            Node.objects.create(
                tree=tree,
                parent=supervised_learning,
                title='Random Forests',
                user_notes='Ensemble of decision trees for improved accuracy.',
                created_by=user,
                sibling_order=3
            )

            # Create child nodes for Unsupervised Learning
            Node.objects.create(
                tree=tree,
                parent=unsupervised_learning,
                title='K-Means Clustering',
                user_notes='Partitioning data into K clusters based on similarity.',
                created_by=user,
                sibling_order=1
            )

            Node.objects.create(
                tree=tree,
                parent=unsupervised_learning,
                title='Principal Component Analysis (PCA)',
                user_notes='Dimensionality reduction technique.',
                created_by=user,
                sibling_order=2
            )

            # Create another tree
            tree2, created2 = Tree.objects.get_or_create(
                owner=user,
                title='Web Development Stack',
                defaults={
                    'visibility': 'private'
                }
            )

            if created2:
                TreeMember.objects.create(
                    tree=tree2,
                    user=user,
                    role='owner'
                )

                frontend = Node.objects.create(
                    tree=tree2,
                    title='Frontend',
                    user_notes='Client-side technologies',
                    created_by=user,
                    sibling_order=1
                )

                backend = Node.objects.create(
                    tree=tree2,
                    title='Backend',
                    user_notes='Server-side technologies',
                    created_by=user,
                    sibling_order=2
                )

                Node.objects.create(
                    tree=tree2,
                    parent=frontend,
                    title='React',
                    user_notes='JavaScript library for building user interfaces',
                    created_by=user,
                    sibling_order=1
                )

                Node.objects.create(
                    tree=tree2,
                    parent=backend,
                    title='Django',
                    user_notes='Python web framework',
                    created_by=user,
                    sibling_order=1
                )

            self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
            self.stdout.write(self.style.SUCCESS(f'Trees created: 2'))
            self.stdout.write(self.style.SUCCESS(f'Nodes created: {Node.objects.filter(tree__owner=user).count()}'))

        else:
            self.stdout.write(self.style.WARNING(f'Tree "{tree.title}" already exists. Skipping...'))
