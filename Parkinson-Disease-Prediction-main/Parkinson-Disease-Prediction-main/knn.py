# import all necessary libraries
import pandas
import sklearn
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import matthews_corrcoef, classification_report, accuracy_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import MinMaxScaler

# load the dataset
url = "data.csv"

# feature names
features = [
    "MDVP:Fo(Hz)","MDVP:Fhi(Hz)","MDVP:Flo(Hz)",
    "MDVP:Jitter(%)","MDVP:Jitter(Abs)","MDVP:RAP","MDVP:PPQ","Jitter:DDP",
    "MDVP:Shimmer","MDVP:Shimmer(dB)","Shimmer:APQ3","Shimmer:APQ5",
    "MDVP:APQ","Shimmer:DDA","NHR","HNR","RPDE","DFA",
    "spread1","spread2","D2","PPE","status"
]

dataset = pandas.read_csv(url, names=features)

# convert dataset to array
array = dataset.values

# separate features and labels
X = array[:, 0:22]     # features
Y = array[:, 22]       # labels (DO NOT scale this)

# scale only features
scaler = MinMaxScaler(feature_range=(0, 1))
X = scaler.fit_transform(X)

# split dataset
validation_size = 0.25
seed = 7

X_train, X_validation, Y_train, Y_validation = train_test_split(
    X, Y, test_size=validation_size, random_state=seed
)

print("Sample training data:\n", X_train[:5])

# cross validation setup
num_folds = 10
scoring = 'accuracy'

# model
clf = KNeighborsClassifier()

# FIXED KFold
kfold = sklearn.model_selection.KFold(
    n_splits=10,
    shuffle=True,
    random_state=seed
)

# cross validation score
cv_results = cross_val_score(clf, X_train, Y_train, cv=kfold, scoring=scoring)
print("\nCross-validation accuracy:", cv_results.mean() * 100)

# train model
clf.fit(X_train, Y_train)

# predictions
predictions = clf.predict(X_validation)

# results
print("\nKNN Results:")
print("Accuracy:", accuracy_score(Y_validation, predictions) * 100)
print("MCC:", matthews_corrcoef(Y_validation, predictions))
print("\nClassification Report:\n", classification_report(Y_validation, predictions))
print(predictions)
print("\nPatient\tActual\tPredicted")

for i in range(len(predictions)):
    actual = int(Y_validation[i])
    pred = int(predictions[i])

    if actual == pred:
        status = "✅"
    else:
        status = "❌"

    print(f"{i+1}\t{actual}\t{pred} {status}")