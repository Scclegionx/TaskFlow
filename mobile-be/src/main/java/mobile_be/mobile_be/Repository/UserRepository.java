package mobile_be.mobile_be.Repository;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import mobile_be.mobile_be.Model.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Repository
public class UserRepository {

    private final Firestore db = FirestoreClient.getFirestore();

    public List<User> findAll() throws ExecutionException, InterruptedException {
        CollectionReference users = db.collection("users");
        return users.get().get().getDocuments().stream()
                .map(doc -> doc.toObject(User.class))
                .collect(Collectors.toList());
    }

    public User save(User user) throws ExecutionException, InterruptedException {
        db.collection("users").document(user.getId().toString()).set(user).get();
        return user;
    }
}