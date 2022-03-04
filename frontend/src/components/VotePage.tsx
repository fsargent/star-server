import { useEffect, useState } from "react"
import StarBallot from "./StarBallot";
import Button from "./Button";
import useFetch from "../useFetch";
import { useParams } from "react-router";
import React from 'react'
import { useNavigate } from "react-router";
import { Ballot } from "../../../domain_model/Ballot";
import { Vote } from "../../../domain_model/Vote";
import { Score } from "../../../domain_model/Score";
import { Container } from "@material-ui/core";
const VotePage = ({ }) => {
  const { id } = useParams();
  const { data: election, isPending, error } = useFetch(`/API/Election/${id}`)
  const [rankings, setRankings] = useState([])
  const navigate = useNavigate();
  console.log(election)
  const onUpdate = (rankings) => {
    setRankings(rankings)
    console.log(rankings)
  }
  const submit = () => {
    console.log(election)
    console.log(election.Candidates)
    console.log(rankings)

    const votes:Vote[] = [{
        race_id: '0',
        scores: election.races[0].candidates.map((candidate, i) =>
          ({ 'candidate_id': election.races[0].candidates[i].candidate_id, 'score': rankings[i] } as Score)
        )
      }]

    const ballot:Ballot = {
      ballot_id: '0', //Defaults to zero but is assigned ballot id by server when submitted
      election_id: election.election_id,
      votes:votes,
      date_submitted: new Date(),
      status: 'submitted',

    }
    console.log(ballot)
    fetch(`/API/Election/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ballot)
    })
    navigate(`/ElectionResults/${id}`)
  }
  return (
    <Container >
      <>
        {error && <div> {error} </div>}
        {isPending && <div> Loading Election... </div>}
        {election &&
          <StarBallot
            race={election.races[0]}
            candidates={election.races[0].candidates}
            onUpdate={onUpdate}
            defaultRankings={Array(election.races[0].candidates.length).fill(0)}
            readonly={false}
            onSubmitBallot={submit}
          />}
      </>
    </Container>
  )
}

export default VotePage