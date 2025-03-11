package mobile_be.mobile_be.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.WriteResult;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class FirestoreService {

    private final Firestore db;

    public FirestoreService() {
        db = FirestoreOptions.getDefaultInstance().getService();
    }

    public void addTask(String taskId, String title, String description) {
        DocumentReference docRef = db.collection("tasks").document(taskId);

        Map<String, Object> task = new HashMap<>();
        task.put("title", title);
        task.put("description", description);

        try {
            WriteResult result = docRef.set(task).get();
            System.out.println("Task added at: " + result.getUpdateTime());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
    }
}