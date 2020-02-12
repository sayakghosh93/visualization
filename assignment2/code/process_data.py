from sklearn.cluster import KMeans
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from mpl_toolkits.mplot3d import Axes3D
from sklearn.metrics import pairwise_distances
from sklearn.manifold import MDS
import random

numerical_features = ['Acceleration', 'Age', 'Aggression', 'Agility', 'Balance', 'BallControl', 'Composure', 'Crossing',
                      'Dribbling', 'Finishing', 'Overall', 'Vision', 'ShortPassing', 'ShotPower', 'Strength']


def getKMeans(X):
    K = range(1, 101)
    distortions = []
    for k in K:
        kmeans = KMeans(n_clusters=k, random_state=0).fit(X)
        distortions.append(np.mean(np.min(cdist(X, kmeans.cluster_centers_, 'euclidean'), axis=1)))

    return [i for i in range(1, 101)], distortions


def assignLabels(df, k):
    X = df.values
    labels = KMeans(n_clusters=k, random_state=0).fit_predict(X)
    df['class'] = labels
    return df

def stratified_sampling(df, col):
    df_ = df.groupby(col).apply(lambda x: x.sample(frac=0.75))
    df_.index = df_.index.droplevel(0)
    return df_


def findPCAComponents(df):
    X = df.values
    pca = PCA(n_components=len(numerical_features))
    principalComponents = pca.fit(X)
    return principalComponents


def findDominantPCAProjections(pca, df):
    pca1 = pca.components_[0]
    pca2 = pca.components_[1]

    pca_length = len(pca1)
    rows = df.values

    values = []
    for row in rows:
        xsum = 0
        ysum = 0
        for j in range(pca_length):
            xsum += pca1[j] * row[j]
            ysum += pca2[j] * row[j]

        values.append([xsum, ysum])

    return values


def findMaxPCALoadedAttributes(pca):
    pca_components = pca.components_
    pca_wts = pca.explained_variance_ratio_
    feature_wts = []
    final_data = []
    for i in range(len(numerical_features)):
        fsum = 0
        for pca_component in pca_components:
            fsum += pca_component[i] * pca_wts[i]
        feature_wts.append((abs(fsum), i))

    feature_wts = sorted(feature_wts)
    for feature in feature_wts:
        final_data.append({'x': numerical_features[feature[1]], 'y': feature[0]})
    return final_data[::-1]


def plotScatter(X, Y):
    plt.scatter(X, Y)
    plt.title('2D Scatter plot Principal Components')
    plt.xlabel('PCA1')
    plt.ylabel('PCA2')
    plt.show()


def plotScatter3D(X, Y, Z, columns):
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(X, Y, Z)
    ax.set_xlabel(columns[0])
    ax.set_ylabel(columns[1])
    ax.set_zlabel(columns[2])
    plt.show()


def findFeatureProjections(rows, importantFeatures):
    X = []
    Y = []
    Z = []
    for row in rows:
        X.append(row[importantFeatures[0]])
        Y.append(row[importantFeatures[1]])
        Z.append(row[importantFeatures[2]])
    return X, Y, Z


def findMDS(X, option="euclidean"):
    values = []
    if option == "euclidean":
        D = pairwise_distances(X, metric="euclidean")
    else:
        D = pairwise_distances(X, metric="cosine")
    model = MDS(n_components=2, dissimilarity='precomputed', random_state=1)
    out = model.fit_transform(D)
    X, Y = out[:, 0], out[:, 1]
    for i in range(len(X)):
        values.append([X[i], Y[i]])
    return values


def loadAndCleanData(filename):
    df = pd.read_csv(filename)
    numerical_features = ['Acceleration', 'Age', 'Aggression', 'Agility', 'Balance', 'BallControl', 'Composure',
                          'Crossing',
                          'Dribbling', 'Finishing', 'Overall', 'Vision', 'ShortPassing', 'ShotPower', 'Strength']
    df = df[numerical_features]
    df.dropna(inplace=True)
    return df


def formXYTuples(X, Y):
    values = []
    for i in range(len(X)):
        values.append({"x": X[i], "y": Y[i]})
    return values


def deriveData(df):
    valueMap = {}
    pca = findPCAComponents(df)
    pcay = pca.explained_variance_ratio_
    pcay2 = np.cumsum(pca.explained_variance_ratio_)
    pcax = [i + 1 for i in range(len(pcay))]
    pcaScreeValues = []
    for i in range(len(pcay)):
        pcaScreeValues.append({"x": pcax[i], "y": pcay[i], "y2": pcay2[i]})
    valueMap['screeData'] = pcaScreeValues
    pcaProjValues = findDominantPCAProjections(pca, df)
    valueMap['pcaData'] = pcaProjValues
    valueMap['mdsData'] = findMDS(df.values)
    valueMap['loadedAttributesData'] = findMaxPCALoadedAttributes(pca)
    return valueMap


def constructData(filename):
    dataMap = {}
    df = loadAndCleanData(filename)
    random_df = df.sample(frac=0.75, replace=True, random_state=1)
    K, distortions = getKMeans(df.values)
    df = assignLabels(df, 15)
    dataMap['kmeansData'] = formXYTuples(K, distortions)
    stratified_df = stratified_sampling(df, 'class')

    dataMap['all'] = deriveData(df)
    dataMap['random'] = deriveData(random_df)
    dataMap['stratified'] = deriveData(stratified_df)

    return dataMap


