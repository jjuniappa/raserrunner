# Laser Runner Unity Starter

## 적용된 요청
1. 캐릭터 에셋 업로드용 폴더:
   `Assets/Art/Characters/CharacterAssets`
2. 실제 캐릭터 에셋이 없을 때:
   `PlayerVisualRoot/PlaceholderBlock` 큐브가 캐릭터로 표시됩니다.
3. 레이저:
   환경은 흑백으로 두고 레이저만 빨간색을 사용합니다.
4. 레이저 높이:
   - 낮은 레이저: 점프로 회피
   - 높은 레이저: 슬라이딩으로 회피
5. 난이도:
   시간 경과에 따라 레이저 이동 속도 증가 및 생성 간격 감소

## Unity 설정 순서
1. 새 3D 프로젝트를 만듭니다.
2. 이 패키지의 `Assets` 폴더 내용을 프로젝트 `Assets`에 복사합니다.
3. `Laser` 태그를 생성합니다.
4. 흰색/회색 환경 머티리얼과 빨간색 레이저 머티리얼을 만듭니다.
   - Built-in: Standard Shader의 Albedo를 빨강으로 설정
   - URP: URP/Lit 또는 Unlit의 Base Color를 빨강으로 설정
   - 발광 효과를 원하면 Emission도 빨강으로 설정
5. 빈 게임 오브젝트에 `PrototypeSceneBuilder`를 붙이고 머티리얼을 연결합니다.
6. 플레이:
   - Space 또는 ↑ : 점프
   - ↓ 또는 S : 슬라이딩

## 추후 캐릭터 교체
1. 캐릭터 파일을 `Assets/Art/Characters/CharacterAssets`에 넣습니다.
2. 캐릭터 프리팹을 `PlayerVisualRoot` 아래에 배치합니다.
3. `PlaceholderBlock`을 비활성화합니다.
4. 캐릭터 크기와 발 위치가 바닥에 맞도록 조정합니다.

## 권장 레이어/충돌
- Player: CharacterController
- Laser: BoxCollider, 태그 `Laser`
- Environment: Default 또는 Environment 전용 레이어
