## 기술스택

* React Native (Expo)
* TypeScript
* JavaScript (ES6+)

---

## 프로젝트 구조

```bash
src/
 ├── app/            # 라우팅 및 화면 구성
 ├── components/     # 재사용 UI 컴포넌트
 ├── features/       # 기능 단위 로직
 ├── lib/            # 공통 설정
 ├── constants/      # 상수 관리
 └── assets/         # 이미지 등 리소스
```

---

## 협업 방식

1. 이슈를 생성한다.
2. 이슈를 기반으로 브랜치를 생성한다.

   * ex: `feat/#3`
3. 브랜치를 생성한 후에 작업을 진행한다.
4. 진행한 후에 커밋을 한다.
5. 작업이 완료되면 PR을 생성한다.
6. PR을 생성한 후에 팀원들에게 리뷰를 요청한다.
7. 리뷰 승인 후 develop branch에 merge한다.

---

## Branch 전략

* `main` : 배포 브랜치
* `develop` : 개발 브랜치
* `feat/*` : 기능 개발 브랜치

---

## Commit Convention

```bash
feat: 새로운 기능 구현
add: 파일 추가
del: 코드 삭제
fix: 버그 수정
docs: 문서 작업
style: 스타일 변경
refactor: 리팩토링
test: 테스트 코드
chore: 기타 수정
```

---

## Code Convention

### 구조 원칙

* components: 재사용 UI
* screens: 화면 단위
* assets: 리소스

---

### 금지 사항

* 하나의 파일에 UI + 로직 혼합 금지
* 코드 중복 최소화

