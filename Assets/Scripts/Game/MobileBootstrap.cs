using UnityEngine;

public class MobileBootstrap : MonoBehaviour
{
    [SerializeField] private int targetFrameRate = 60;
    [SerializeField] private bool keepScreenAwake = true;
    [SerializeField] private bool useLandscape = true;

    private void Awake()
    {
        Application.targetFrameRate = targetFrameRate;
        QualitySettings.vSyncCount = 0;

        if (keepScreenAwake)
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

        if (useLandscape)
        {
            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;
        }

        Input.multiTouchEnabled = true;
    }
}
