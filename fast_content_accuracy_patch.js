(function(g){
'use strict';
if(g.applyHistory2FastAccuracy)return;

const PATCH={
  d7q04:{
    options:{2:'미군정이 직접 통치하고 다른 한국인 정치 조직을 공식 정부로 인정하지 않았다'},
    why:'미군정은 38도선 이남을 직접 통치했고 대한민국 임시 정부와 조선 인민 공화국 등 한국인 정치 조직을 공식 정부로 인정하지 않았습니다.',
    recovery:{clue:'광복 직후 남한은 미군정의 직접 통치였고, 기존 한국인 정치 조직은 공식 정부로 인정되지 않았습니다.',ox:{correction:'미군정은 대한민국 임시 정부를 공식 정부로 인정하지 않았습니다.'}}
  },
  d7q10:{
    recovery:{ox:{correction:'유엔은 유엔 한국 임시 위원단이 활동할 수 있는 지역에서 선거를 실시하기로 했고, 5·10 총선거는 남한에서 위원단의 감시 아래 실시되었습니다.'}}
  },
  d7q13:{
    why:'반민족 행위 처벌법과 반민특위가 있었지만 이승만 정부의 반대·비협조와 1949년 경찰의 반민특위 사무실 습격 등으로 활동이 크게 위축되었습니다.',
    recovery:{clue:'법과 위원회는 있었지만 정부의 반대와 경찰의 습격 등으로 반민특위 활동이 약화되었습니다.',ox:{correction:'반민특위는 정부의 반대·비협조와 경찰의 사무실 습격 등으로 활동이 크게 위축되었습니다.'}}
  },
  d7q15:{
    why:'1947년 3·1절 경찰 발포 사건 이후 제주 사회의 갈등이 커졌고, 1948년 단독 선거·단독 정부 반대와 탄압에 대한 저항 속에서 무장 봉기와 진압이 이어지며 많은 제주도민이 희생되었습니다.',
    recovery:{clue:'1947년 경찰 발포 이후의 갈등 → 1948년 무장 봉기와 단독 선거 반대 → 무력 충돌과 진압 과정의 주민 희생으로 연결합니다.',ox:{correction:'제주 4·3 사건은 무장대와 토벌대의 무력 충돌 및 진압 과정에서 많은 제주도민이 희생된 사건입니다.'}}
  },
  d8q01:{
    why:'1950년 1월 12일 미국 국무 장관 딘 애치슨은 태평양 방위선을 설명했고, 그 선에 한반도는 포함되지 않았습니다.',
    recovery:{clue:'애치슨 선언은 미국이 설명한 태평양 방위선의 범위를 묻는 개념입니다. 이것 하나만으로 전쟁 발발 원인을 단정하지 않습니다.',ox:{correction:'애치슨이 설명한 태평양 방위선에는 한반도가 포함되지 않았습니다.'}}
  },
  d8q03:{
    why:'유엔 안전 보장 이사회의 결의에 따라 여러 회원국이 대한민국에 군사 지원을 제공했고, 미국 주도의 통합 지휘 체계 아래 유엔군이 참전했습니다.',
    recovery:{clue:'유엔 안보리 결의 → 회원국의 군사 지원 → 유엔군 참전으로 연결합니다.',ox:{correction:'유엔 안보리 결의에 따라 여러 회원국이 병력을 제공했고 미군이 주력으로 참여했습니다.'}}
  },
  d9q04:{
    q:'박정희가 세 번째 대통령 임기에 도전할 수 있도록 1969년 추진한 개헌은?',
    why:'1969년 3선 개헌으로 박정희의 세 번째 대통령 선거 출마가 가능해졌습니다.',
    recovery:{clue:'박정희의 3선 출마를 가능하게 한 개헌 = 3선 개헌입니다.',ox:{correction:'1969년 3선 개헌으로 대통령의 3선 연임이 가능해졌습니다.'}}
  },
  d15q06:{
    q:'1919년 대한민국 임시 정부가 수립된 중국의 도시는?',
    why:'대한민국 임시 정부는 1919년 상하이에서 수립되었습니다. 이후 여러 중국 도시를 옮겨 다니다가 1940년 충칭에 정착했습니다.',
    recovery:{path:['3·1 운동 이후','1919 대한민국 임시 정부 수립','상하이'],clue:'수립지는 상하이입니다. 임시 정부는 이후 여러 중국 도시를 이동했습니다.'}
  },
  d17src08:{
    why:'제주 4·3 사건은 1947년 3·1절 경찰 발포 사건을 기점으로 갈등이 깊어진 뒤, 1948년 단독 선거·단독 정부 반대와 탄압에 대한 저항 속에서 무장 봉기와 진압으로 이어졌습니다.',
    recovery:{clue:'제주 4·3은 1947년 경찰 발포 이후의 갈등과 1948년 단독 선거 반대, 무장 봉기와 진압의 흐름을 함께 봅니다.',ox:{correction:'제주 4·3 사건의 무력 충돌과 진압 과정에서 많은 제주도민이 희생되었습니다.'}}
  }
};

function merge(target,patch){
  if(!target||!patch)return target;
  Object.keys(patch).forEach(k=>{
    const pv=patch[k];
    if(k==='options'&&pv&&typeof pv==='object'&&!Array.isArray(pv)){
      if(Array.isArray(target.options))Object.keys(pv).forEach(i=>{target.options[Number(i)]=pv[i]});
    }else if(pv&&typeof pv==='object'&&!Array.isArray(pv)){
      if(!target[k]||typeof target[k]!=='object'||Array.isArray(target[k]))target[k]={};
      merge(target[k],pv);
    }else target[k]=pv;
  });
  return target;
}

function apply(content){
  if(!content||!Array.isArray(content.questions))return content;
  content.questions.forEach(q=>{if(q&&q.id&&PATCH[q.id])merge(q,PATCH[q.id])});
  content.accuracyAudit='2026-08-17';
  return content;
}

g.HISTORY2_FAST_ACCURACY_PATCH=PATCH;
g.applyHistory2FastAccuracy=apply;
})(window);
