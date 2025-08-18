from sklearn.neighbors import NearestNeighbors
import numpy as np

# Example data for alumni profiles (e.g., skills, location, etc.)
alumni_data = np.array([
    [1, 1, 0, 0, 1, 2],  # Skills and location vectors
    [0, 1, 1, 1, 0, 1],
    # Add more alumni data here...
])

# Train a KNN model on alumni data
knn = NearestNeighbors(n_neighbors=5)
knn.fit(alumni_data)

def match_student(student_data):
    distances, indices = knn.kneighbors([student_data])
    return indices[0]
