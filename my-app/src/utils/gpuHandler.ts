
export async function runAsync (url:string,model:string='Modi'){
    const body = JSON.stringify(
        {
        "input": {   
                "song": url,
                "rvc": model,
                "transpose": 0,
                "pitch_extraction_algorithm": "crepe",
                "search_feature_ratio": 0.76,
                "filter_radius": 3,
                "resample_output": 0,
                "volume_envelope": 0.25,
                "voiceless_protection": 0.1,
                "hop_len": 128
        }
        ,
          "policy": {
        "executionTimeout": Number(process.env.EXECTION_TIMEOUT),
        "ttl": Number(process.env.TIME_TO_LIVE)}
    }
    )
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/run`,{
        method:'POST',
        headers:{
            'content-type':'application/json',
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        },
        body
    })
    const data  = await res.json()
    return data

    
}

export async function runSync (url:string,model:string='Modi'){
    const body = JSON.stringify(
        {
        "input": {   
                "song": url,
                "rvc": model,
                "transpose": 0,
                "pitch_extraction_algorithm": "crepe",
                "search_feature_ratio": 0.76,
                "filter_radius": 3,
                "resample_output": 0,
                "volume_envelope": 0.25,
                "voiceless_protection": 0.1,
                "hop_len": 128
        }
        ,
          "policy": {
        "executionTimeout": Number(process.env.EXECTION_TIMEOUT),
        "ttl": Number(process.env.TIME_TO_LIVE)}
    }
    )
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/runsync`,{
        method:'POST',
        headers:{
            'content-type':'application/json',
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        },
        body
    })
    const data  = await res.json()
    return data

    
}
export async function checkStatus(id:string){
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/status/${id}`,{
        method:'GET',
        headers:{
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        }
    })
    const data  = await res.json()
    return data
}
export async function checkHealth(){
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/health`,{
        method:'GET',
        headers:{
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        }
    })
    const data  = await res.json()
    console.log('checkdata',data)
    if(data && data.workers && Number(data.workers["ready"])>0 && (data.workers["throttled"]<Number(process.env.TOTAL_WORKERS))){
        return true
    }
    return false
}
export async function cancelTask(id:string){
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/cancel/${id}`,{
        method:'GET',
        headers:{
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        }
    })
    const data  = await res.json()
    return data
}
export async function purgeQueue(id:string){
    const res = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_SERVERLESS_ID}/purge-queue`,{
        method:'POST',
        headers:{
            'content-type':'application/json',
            'authorization':process.env.RUNPOD_API_KEY ? process.env.RUNPOD_API_KEY :'abc'
        }
    })
    const data  = await res.json()
    return data
}
