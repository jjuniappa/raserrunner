using UnityEngine;

public class LaserObstacle : MonoBehaviour
{
    [SerializeField] private float startSpeed = 6f;
    [SerializeField] private float accelerationPerSecond = 0.18f;
    [SerializeField] private float maxSpeed = 18f;
    [SerializeField] private float destroyX = -14f;

    private static float sessionElapsedTime;

    public static void ResetSessionSpeed()
    {
        sessionElapsedTime = 0f;
    }

    private void Update()
    {
        if (GameManager.Instance != null && GameManager.Instance.IsGameOver)
            return;

        sessionElapsedTime += Time.deltaTime;
        float speed = Mathf.Min(
            startSpeed + sessionElapsedTime * accelerationPerSecond,
            maxSpeed
        );

        transform.Translate(Vector3.left * speed * Time.deltaTime, Space.World);

        if (transform.position.x <= destroyX)
            Destroy(gameObject);
    }
}
