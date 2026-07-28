using System.Collections;
using UnityEngine;

public class LaserSpawner : MonoBehaviour
{
    [SerializeField] private GameObject laserPrefab;

    [Header("Two fixed laser heights")]
    [SerializeField] private float jumpLaserHeight = 0.55f;
    [SerializeField] private float slideLaserHeight = 1.55f;

    [Header("Spawn timing")]
    [SerializeField] private float startInterval = 2f;
    [SerializeField] private float intervalDecreasePerSecond = 0.015f;
    [SerializeField] private float minimumInterval = 0.75f;

    private float elapsedTime;

    private IEnumerator Start()
    {
        while (true)
        {
            float interval = Mathf.Max(
                startInterval - elapsedTime * intervalDecreasePerSecond,
                minimumInterval
            );

            yield return new WaitForSeconds(interval);
            SpawnLaser();
            elapsedTime += interval;
        }
    }

    private void SpawnLaser()
    {
        bool requiresJump = Random.value < 0.5f;
        float height = requiresJump ? jumpLaserHeight : slideLaserHeight;

        Vector3 spawnPosition = transform.position;
        spawnPosition.y = height;

        Instantiate(laserPrefab, spawnPosition, Quaternion.identity);
    }
}
