using UnityEngine;

public class MobileControlButtons : MonoBehaviour
{
    [SerializeField] private MobilePlayerController player;

    public void OnJumpPressed()
    {
        if (player != null)
            player.Jump();
    }

    public void OnSlidePressed()
    {
        if (player != null)
            player.Slide();
    }
}
